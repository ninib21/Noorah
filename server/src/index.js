const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');



const crypto = require('crypto');

const fs = require('fs');
const path = require('path');

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');

const Jimp = require('jimp');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

function nanoid(n=10){
  try{
    return crypto.randomUUID().replace(/-/g,'').slice(0,n);
  }catch(_){ return Math.random().toString(36).slice(2, 2+n); }
}



const PORT = process.env.PORT || 4000;

// In-memory store
const sessions = new Map(); // id -> { id, bookingId, sitterId, parentId, intervalSec, startedAt, lastCheckInAt, status, share:[], geo:{enabled:false, radius:100, center:null} }

function computeStatus(s){
  if (!s || s.status === 'stopped') return 'stopped';
  const now = Date.now();
  const last = s.lastCheckInAt || s.startedAt;
  const interval = s.intervalSec || 60;
  const grace = (s.graceSec != null ? s.graceSec : (process.env.NR_GRACE_SEC ? parseInt(process.env.NR_GRACE_SEC,10) : 15));
  const elapsed = (now - last) / 1000;
  if (elapsed > interval + grace) return 'missed';
  return 'ontrack';
}

function getCountdown(s){
  if (!s || s.status === 'stopped') return 0;
  const now = Date.now();
  const last = s.lastCheckInAt || s.startedAt;
  const remain = Math.max(0, (s.intervalSec||60) - Math.floor((now - last)/1000));
  return remain;
}

// Simple JSON persistence (mock)
const DATA_DIR = path.join(__dirname, '..', 'data');
const SESS_FILE = path.join(DATA_DIR, 'sessions.json');
function ensureDataDir(){ try{ fs.mkdirSync(DATA_DIR, { recursive:true }); }catch(_){} }
function saveAll(){
  ensureDataDir();
  const payload = JSON.stringify({ sessions: Array.from(sessions.values()) }, null, 2);
  try{ fs.writeFileSync(SESS_FILE, payload); }catch(_){ }
}
function loadAll(){
  try{
    const txt = fs.readFileSync(SESS_FILE, 'utf8');
    const obj = JSON.parse(txt);
    if(obj && Array.isArray(obj.sessions)){
      for(const s of obj.sessions){ sessions.set(s.id, s); }
    }
  }catch(_){ /* ignore */ }
}
loadAll();

// Web server
const app = express();
// Global rate limiter (mock-friendly but protective)
app.use(rateLimit({ windowMs: 60*1000, max: 120, standardHeaders: true, legacyHeaders: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), features: 20, server: 'NannyRadar' });
});

function validate(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error:'bad_request', details: errors.array() });
  next();
}
// JWT secret (dev only)
const JWT_SECRET = process.env.NR_JWT_SECRET || 'dev-secret-not-for-prod';
// In-memory rotation map: sessionId -> current jwt id (jti)
const activeJti = new Map();

app.use(cors());
app.use(express.json());

// REST endpoints
app.post('/api/sessions/start',
  body('intervalSec').optional().isInt({ min: 3, max: 24*3600 }),
  body('graceSec').optional().isInt({ min: 0, max: 600 }),
  body('bookingId').optional().isString().isLength({ max: 64 }),
  validate,
(req, res) => {
  const { bookingId='demo-booking', sitterId='sitter-1', parentId='parent-1', intervalSec=60, graceSec } = req.body || {};
  const id = nanoid(10);
  const startedAt = Date.now();
  const session = { id, bookingId, sitterId, parentId, intervalSec, graceSec: (graceSec!=null?parseInt(graceSec,10):undefined), startedAt, lastCheckInAt: startedAt, status: 'active', share: [], geo: { enabled:false, radius:100, center:null } };
  sessions.set(id, session);
  saveAll();
  // issue a JWT with jti bound to this session
  const jti = nanoid(8);
  activeJti.set(id, jti);
  const token = jwt.sign({ sub: id, jti }, JWT_SECRET, { expiresIn: '1h' });
  broadcast(id, { type:'start', sessionId:id, payload:{ startedAt, intervalSec, graceSec: session.graceSec } });
  res.json({ sessionId:id, token, startedAt, intervalSec, graceSec: session.graceSec, status:'ontrack' });
});

app.post('/api/sessions/:id/check-in',
  param('id').isString().isLength({ min: 1, max: 100 }),
  validate,
(req, res) => {
  try{
    const id = req.params.id; const s = sessions.get(id);
    if(!s) return res.status(404).json({ error:'not_found' });
    if(s.status === 'stopped') return res.status(400).json({ error:'stopped' });
    s.lastCheckInAt = Date.now(); s.status='active';
    appendEvent(id, 'check-in', { lastCheckInAt: s.lastCheckInAt });
    // rotate token on each check-in (optional hardening)
    const jti = nanoid(8); activeJti.set(id, jti);
    const token = jwt.sign({ sub: id, jti }, JWT_SECRET, { expiresIn: '1h' });

    saveAll();
    broadcast(id, { type:'check-in', sessionId:id, payload:{ lastCheckInAt: s.lastCheckInAt } });
    res.json({ ok:true, lastCheckInAt: s.lastCheckInAt, status: computeStatus(s), token });
  }catch(e){ console.error('check-in error', e); res.status(500).json({ error:'internal' }); }
});

app.post('/api/sessions/:id/stop',
  param('id').isString().isLength({ min: 1, max: 100 }),
  validate,
(req, res) => {
  const id = req.params.id; const s = sessions.get(id);
  if(!s) return res.status(404).json({ error:'not_found' });
  s.status = 'stopped';
  activeJti.delete(id);
  appendEvent(id, 'stop', {});
  saveAll();
  broadcast(id, { type:'stop', sessionId:id, payload:{} });
  res.json({ ok:true, status:'stopped' });
});

app.get('/api/sessions/:id/status', (req, res) => {
  const id = req.params.id; const s = sessions.get(id);
  if(!s) return res.status(404).json({ error:'not_found' });
  const status = computeStatus(s);
  const countdownSec = getCountdown(s);
  res.json({ sessionId:id, status, countdownSec, lastCheckInAt: s.lastCheckInAt, intervalSec: s.intervalSec });
});

// Events history (ephemeral in this mock, saved with sessions snapshot)
function appendEvent(sessionId, type, payload){
  const s = sessions.get(sessionId); if(!s) return;
  if(!Array.isArray(s.events)) s.events = [];
  s.events.unshift({ ts: Date.now(), type, payload: payload||{} });
  s.events = s.events.slice(0, 100);
}


app.post('/api/sessions/:id/share', (req, res) => {
  const id = req.params.id; const s = sessions.get(id);
  if(!s) return res.status(404).json({ error:'not_found' });
  const { contacts=[] } = req.body || {};
  s.share = contacts;
  appendEvent(id, 'share_update', { contacts });
  saveAll();
  broadcast(id, { type:'share_update', sessionId:id, payload:{ contacts } });
  res.json({ ok:true });
// --- Feature 4: Secure Video Snapshot Verification (privacy-first) ---
// Store only transient files; delete after compare; keep minimal audit event
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
function ensureUploadDir(){ try{ fs.mkdirSync(UPLOAD_DIR, { recursive:true }); }catch(_){} }
ensureUploadDir();

async function compareImages(bufA, bufB){
  const a = await Jimp.read(bufA);
  const b = await Jimp.read(bufB);
  // Normalize sizes
  b.resize(a.getWidth(), a.getHeight());
  let diff = Jimp.diff(a, b).percent; // 0..1
  // Similarity score: 1 - diff
  return 1 - diff;
}

// Reference upload (short-lived, overwritten)
app.post('/api/verify/reference/:sitterId',
  param('sitterId').isString().isLength({ min:1, max:64 }), validate,
  express.raw({ type: ['image/jpeg','image/png'], limit: '5mb' }),
async (req,res)=>{
  const sitterId = req.params.sitterId;
  const refPath = path.join(UPLOAD_DIR, `ref_${sitterId}.jpg`);
  try{
    fs.writeFileSync(refPath, req.body);
    res.json({ ok:true });
  }catch(e){ res.status(500).json({ error:'write_failed' }); }
});

// Arrival snapshot compare
app.post('/api/verify/arrival',
  express.raw({ type: ['image/jpeg','image/png'], limit: '5mb' }),
  query('sitterId').isString().isLength({ min:1, max:64 }), validate,
async (req,res)=>{
  try{
    const sitterId = req.query.sitterId;
    const refPath = path.join(UPLOAD_DIR, `ref_${sitterId}.jpg`);
    if(!fs.existsSync(refPath)) return res.status(400).json({ error:'no_reference' });
    const refBuf = fs.readFileSync(refPath);
    const score = await compareImages(refBuf, req.body);
    const verified = score >= 0.75; // threshold
    appendEvent(sitterId, 'arrival_verification', { verified, score });
    return res.json({ verified, score });
  }catch(e){ return res.status(500).json({ error:'verify_failed' }); }
});

// --- Feature 5: Panic Button + Emergency Dispatch (email) ---
function makeTransport(){
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
  if(SMTP_HOST && SMTP_PORT && FROM_EMAIL){
    return nodemailer.createTransport({ host: SMTP_HOST, port: parseInt(SMTP_PORT,10), secure: false,
      auth: SMTP_USER? { user: SMTP_USER, pass: SMTP_PASS }: undefined });
  }
  return null;
}

app.post('/api/emergency/trigger',
  body('sessionId').isString().isLength({ min:1, max:100 }),
  body('contacts').isArray({ min:1 }),
  body('message').optional().isString().isLength({ max: 500 }),
  body('location').optional().isObject(),
  validate,
async (req,res)=>{
  const { sessionId, contacts, message, location } = req.body;
  appendEvent(sessionId, 'panic_triggered', { message, location });
  const t = makeTransport();
  if(t){
    const subj = `NannyRadar Emergency Alert for session ${sessionId}`;
    const text = `Emergency reported.\nSession: ${sessionId}\nMessage: ${message||''}\nLocation: ${location? JSON.stringify(location): 'n/a'}`;
    try{ await t.sendMail({ from: process.env.FROM_EMAIL, to: contacts.join(','), subject: subj, text }); }catch(_){ }
  }
  broadcast(sessionId, { type:'panic', sessionId, payload:{ message, location } });
  res.json({ ok:true });
});

// --- Feature 6: Auto-Invoice Generator ---
function generateInvoicePdf(data){
  return new Promise((resolve, reject)=>{
    try{
      ensureDataDir();
      const outPath = path.join(DATA_DIR, `invoice_${data.bookingId}.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outPath);
      doc.pipe(stream);
      doc.fontSize(18).text('NannyRadar Invoice', { align:'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Booking ID: ${data.bookingId}`);
      doc.text(`Sitter: ${data.sitterName}`);
      doc.text(`Date: ${data.date}`);
      doc.text(`Hours: ${data.hours}`);
      doc.text(`Amount: $${data.payment}`);
      doc.end();
      stream.on('finish', ()=> resolve(outPath));
      stream.on('error', reject);
    }catch(e){ reject(e); }
  });
}

app.post('/api/invoices/generate',
  body('bookingId').isString().isLength({ min:1, max:64 }),
  body('sitterName').isString().isLength({ min:1, max:128 }),
  body('hours').isFloat({ min:0.25, max: 48 }),
  body('date').isString().isLength({ min:4, max: 64 }),
  body('payment').isFloat({ min:0 }),
  body('parentEmail').optional().isEmail(),


  validate,
async (req,res)=>{
  try{
    const outPath = await generateInvoicePdf(req.body);
    // email if configured
    const t = makeTransport();
    if(t && req.body.parentEmail){
      try{ await t.sendMail({ from: process.env.FROM_EMAIL, to: req.body.parentEmail, subject: `Invoice ${req.body.bookingId}`, text:'Attached is your invoice.', attachments:[{ filename: `invoice_${req.body.bookingId}.pdf`, path: outPath }] }); }catch(_){ }
    }
    appendEvent(req.body.bookingId, 'invoice_generated', { path: outPath });
    res.json({ ok:true, path: outPath });
  }catch(e){ res.status(500).json({ error:'invoice_failed' }); }
});

});

app.get('/api/invoices/:bookingId', (req,res)=>{
  const bookingId = req.params.bookingId;
  const outPath = path.join(DATA_DIR, `invoice_${bookingId}.pdf`);
  if(!fs.existsSync(outPath)) return res.status(404).json({ error:'not_found' });
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(outPath);
});

app.get('/api/sessions/:id/events', (req,res)=>{
  const id = req.params.id; const s = sessions.get(id);
  if(!s) return res.status(404).json({ error:'not_found' });
  res.json({ sessionId:id, events: Array.isArray(s.events)? s.events : [] });
});
// --- Feature 7: Tip Jar for Sitters ---
app.post('/api/tips/process',
  body('sessionId').isString().isLength({ min:1, max:100 }),
  body('amount').isFloat({ min:1, max:500 }),
  body('sitterId').isString().isLength({ min:1, max:64 }),
  body('parentId').isString().isLength({ min:1, max:64 }),
  validate,
async (req,res)=>{
  const { sessionId, amount, sitterId, parentId } = req.body;
  // Mock Stripe processing (replace with real Stripe in production)
  const tipId = nanoid(12);
  const tip = { tipId, sessionId, amount, sitterId, parentId, status: 'completed', createdAt: Date.now() };
  appendEvent(sessionId, 'tip_processed', tip);
  res.json({ ok:true, tipId, status:'completed' });
});

app.get('/api/sitters/:sitterId/tips',
  param('sitterId').isString().isLength({ min:1, max:64 }), validate,
(req,res)=>{
  const sitterId = req.params.sitterId;
  const tips = []; // In real app, query from database
  res.json({ tips, totalEarnings: tips.reduce((sum,t)=>sum+t.amount,0) });
});

// --- Feature 8: Cancellation Window Flex Settings ---
const CANCELLATION_POLICIES = {
  '2hr': { hours: 2, refundPercent: 50 },
  '6hr': { hours: 6, refundPercent: 75 },
  '24hr': { hours: 24, refundPercent: 90 }
};

app.post('/api/bookings/:bookingId/cancel',
  param('bookingId').isString().isLength({ min:1, max:64 }),
  body('policy').isIn(['2hr','6hr','24hr']),
  body('reason').optional().isString().isLength({ max:500 }),
  validate,
async (req,res)=>{
  const { bookingId } = req.params;
  const { policy, reason } = req.body;
  const pol = CANCELLATION_POLICIES[policy];
  const booking = { startTime: Date.now() + 4*3600*1000, amount: 100 }; // Mock booking
  const hoursUntil = (booking.startTime - Date.now()) / 3600000;
  const refundAmount = hoursUntil >= pol.hours ? booking.amount * (pol.refundPercent/100) : 0;
  appendEvent(bookingId, 'booking_cancelled', { policy, refundAmount, reason });
  res.json({ ok:true, refundAmount, policy });
});

// --- Feature 9: Smart Pricing Engine ---
function calculateSmartPrice(baseRate, factors){
  let rate = baseRate;
  if(factors.isHoliday) rate *= 1.5;
  if(factors.isWeekend) rate *= 1.2;
  if(factors.experience > 5) rate *= 1.1;
  if(factors.demand === 'high') rate *= 1.3;
  if(factors.location === 'premium') rate *= 1.2;
  return Math.round(rate * 100) / 100;
}

app.post('/api/pricing/calculate',
  body('baseRate').isFloat({ min:10, max:100 }),
  body('factors').isObject(),
  validate,
(req,res)=>{
  const { baseRate, factors } = req.body;
  const smartRate = calculateSmartPrice(baseRate, factors);
  res.json({ baseRate, smartRate, factors, markup: smartRate - baseRate });
});

// --- Feature 10: Apple Pay & Cash App Pay Integration (Stripe) ---
app.post('/api/payments/create-intent',
  body('amount').isFloat({ min:1, max:1000 }),
  body('currency').optional().isIn(['usd','eur','gbp']),
  body('paymentMethods').isArray(),
  validate,
async (req,res)=>{
  const { amount, currency='usd', paymentMethods } = req.body;
  // Mock Stripe PaymentIntent (replace with real Stripe in production)
  const intentId = `pi_${nanoid(24)}`;
  const clientSecret = `${intentId}_secret_${nanoid(16)}`;
  res.json({
    clientSecret,
    intentId,
    amount: Math.round(amount * 100), // cents
    currency,
    supportedMethods: paymentMethods.filter(m => ['card','apple_pay','cashapp'].includes(m))
  });
});

app.post('/api/payments/confirm',
  body('intentId').isString().isLength({ min:10, max:100 }),
  body('method').isIn(['card','apple_pay','cashapp']),
  validate,
async (req,res)=>{
  const { intentId, method } = req.body;
  // Mock payment confirmation
  const paymentId = nanoid(16);
  appendEvent(intentId, 'payment_confirmed', { paymentId, method });
  res.json({ ok:true, paymentId, status:'succeeded', method });
});
// --- Feature 11: Availability Smart Scheduler ---
const SITTER_AVAILABILITY = new Map(); // Mock availability storage

app.post('/api/sitters/:sitterId/availability',
  param('sitterId').isString().isLength({ min:1, max:64 }),
  body('schedule').isArray(),
  validate,
(req,res)=>{
  const { sitterId } = req.params;
  const { schedule } = req.body;
  SITTER_AVAILABILITY.set(sitterId, { schedule, updatedAt: Date.now() });
  res.json({ ok:true, sitterId, schedule });
});

app.get('/api/sitters/:sitterId/suggested-times',
  param('sitterId').isString().isLength({ min:1, max:64 }),
  validate,
(req,res)=>{
  const sitterId = req.params.sitterId;
  const availability = SITTER_AVAILABILITY.get(sitterId) || { schedule: [] };
  // Mock AI suggestions based on historical patterns
  const suggestions = [
    { start: '2024-01-20T18:00:00Z', end: '2024-01-20T22:00:00Z', confidence: 0.9, reason: 'Popular evening slot' },
    { start: '2024-01-21T14:00:00Z', end: '2024-01-21T18:00:00Z', confidence: 0.8, reason: 'Weekend afternoon availability' }
  ];
  res.json({ sitterId, suggestions, availability: availability.schedule });
});

// --- Feature 12: Predictive Rebooking ---
const BOOKING_HISTORY = new Map(); // Mock booking history

app.post('/api/rebooking/suggest',
  body('parentId').isString().isLength({ min:1, max:64 }),
  body('sitterId').optional().isString().isLength({ min:1, max:64 }),
  validate,
(req,res)=>{
  const { parentId, sitterId } = req.body;
  // Mock predictive logic based on past bookings
  const history = BOOKING_HISTORY.get(parentId) || [];
  const suggestions = [
    { sitterId: sitterId || 'sitter-1', confidence: 0.95, suggestedTimes: ['2024-01-27T18:00:00Z'], reason: 'Same time next week pattern' },
    { sitterId: 'sitter-2', confidence: 0.7, suggestedTimes: ['2024-01-28T14:00:00Z'], reason: 'Weekend preference detected' }
  ];
  res.json({ parentId, suggestions, basedOnBookings: history.length });
});

app.post('/api/rebooking/create',
  body('parentId').isString().isLength({ min:1, max:64 }),
  body('sitterId').isString().isLength({ min:1, max:64 }),
  body('startTime').isISO8601(),
  body('duration').isInt({ min:1, max:12 }),
  validate,
(req,res)=>{
  const { parentId, sitterId, startTime, duration } = req.body;
  const bookingId = nanoid(12);
  const booking = { bookingId, parentId, sitterId, startTime, duration, status: 'confirmed', createdAt: Date.now() };
  // Add to history
  const history = BOOKING_HISTORY.get(parentId) || [];
  history.push(booking);
  BOOKING_HISTORY.set(parentId, history);
  appendEvent(bookingId, 'rebooking_created', booking);
  res.json({ ok:true, booking });
});

// --- Feature 13: Trust Score AI ---
const TRUST_SCORES = new Map(); // Mock trust score storage

function calculateTrustScore(sitterId, metrics){
  let score = 70; // Base score
  if(metrics.onTimeRate > 0.9) score += 15;
  if(metrics.cancellationRate < 0.1) score += 10;
  if(metrics.avgRating > 4.5) score += 15;
  if(metrics.responseTime < 300) score += 5; // 5 min response
  if(metrics.completedBookings > 50) score += 5;
  return Math.min(100, Math.max(0, score));
}

app.post('/api/trust/update',
  body('sitterId').isString().isLength({ min:1, max:64 }),
  body('metrics').isObject(),
  validate,
(req,res)=>{
  const { sitterId, metrics } = req.body;
  const score = calculateTrustScore(sitterId, metrics);
  TRUST_SCORES.set(sitterId, { score, metrics, updatedAt: Date.now() });
  res.json({ sitterId, trustScore: score, metrics });
});

app.get('/api/trust/:sitterId',
  param('sitterId').isString().isLength({ min:1, max:64 }),
  validate,
(req,res)=>{
  const sitterId = req.params.sitterId;
  const data = TRUST_SCORES.get(sitterId) || { score: 75, metrics: {}, updatedAt: Date.now() };
  res.json({ sitterId, trustScore: data.score, lastUpdated: data.updatedAt });
});

// --- Feature 14: Parental AI Assistant ---
app.post('/api/ai-assistant/chat',
  body('message').isString().isLength({ min:1, max:500 }),
  body('context').optional().isObject(),
  validate,
async (req,res)=>{
  const { message, context } = req.body;
  // Mock AI responses for booking assistance
  let response = "I'm here to help you book a sitter!";
  const msg = message.toLowerCase();

  if(msg.includes('book') || msg.includes('sitter')){
    response = "I can help you find and book a sitter. What date and time do you need care?";
  } else if(msg.includes('time') || msg.includes('when')){
    response = "Great! I see you need care. Based on your history, evenings 6-10pm are popular. Would you like me to check sitter availability?";
  } else if(msg.includes('cost') || msg.includes('price')){
    response = "Rates vary by sitter experience and time. Weekend evenings typically range $15-25/hr. Would you like me to show available sitters with pricing?";
  } else if(msg.includes('cancel')){
    response = "I can help with cancellations. Our policies offer 50-90% refunds depending on notice time. Would you like to cancel a booking?";
  }

  res.json({ response, suggestions: ['Find sitters', 'Check availability', 'View pricing', 'Cancel booking'] });
});

app.post('/api/ai-assistant/booking-flow',
  body('step').isIn(['start','datetime','sitter','confirm']),
  body('data').optional().isObject(),
  validate,
(req,res)=>{
  const { step, data } = req.body;
  let response = {};

  switch(step){
    case 'start':
      response = { message: "Let's find you a great sitter! When do you need care?", nextStep: 'datetime', options: ['Today evening', 'Tomorrow', 'This weekend', 'Custom date'] };
      break;
    case 'datetime':
      response = { message: `Perfect! For ${data?.datetime || 'your selected time'}, here are available sitters:`, nextStep: 'sitter', sitters: [{ id: 'sitter-1', name: 'Emma', rate: 18, rating: 4.9 }] };
      break;
    case 'sitter':
      response = { message: `Great choice! ${data?.sitterName || 'Emma'} is excellent. Shall I confirm this booking?`, nextStep: 'confirm', summary: data };
      break;
    case 'confirm':
      response = { message: "Booking confirmed! You'll receive a confirmation email shortly.", nextStep: 'complete', bookingId: nanoid(8) };
      break;
  }

  res.json(response);
});
// --- Feature 15: Voice Assistant Mode (Web Speech API endpoints) ---
app.post('/api/voice/process',
  body('transcript').isString().isLength({ min:1, max:500 }),
  body('intent').optional().isString(),
  validate,
async (req,res)=>{
  const { transcript, intent } = req.body;
  const text = transcript.toLowerCase();
  let response = "I didn't understand that. Please try again.";
  let action = null;

  if(text.includes('book') || text.includes('schedule')){
    response = "I'll help you book a sitter. When do you need care?";
    action = 'show_booking';
  } else if(text.includes('cancel')){
    response = "I can help you cancel a booking. Which booking would you like to cancel?";
    action = 'show_cancellation';
  } else if(text.includes('emergency') || text.includes('panic')){
    response = "Activating emergency mode. Should I alert your emergency contacts?";
    action = 'emergency_mode';
  } else if(text.includes('tip')){
    response = "I can help you tip your sitter. How much would you like to tip?";
    action = 'show_tip';
  }

  res.json({ response, action, confidence: 0.8 });
});

// --- Feature 16: Admin Flag & Review Dashboard ---
const ADMIN_FLAGS = new Map();
const ADMIN_REPORTS = new Map();

app.post('/api/admin/flag',
  body('type').isIn(['message','sitter','parent','booking']),
  body('targetId').isString().isLength({ min:1, max:100 }),
  body('reason').isString().isLength({ min:1, max:500 }),
  body('reporterId').isString().isLength({ min:1, max:64 }),
  validate,
(req,res)=>{
  const { type, targetId, reason, reporterId } = req.body;
  const flagId = nanoid(12);
  const flag = { flagId, type, targetId, reason, reporterId, status: 'pending', createdAt: Date.now() };
  ADMIN_FLAGS.set(flagId, flag);
  res.json({ ok:true, flagId, status:'pending' });
});

app.get('/api/admin/flags',
  query('status').optional().isIn(['pending','reviewed','resolved']),
  validate,
(req,res)=>{
  const status = req.query.status;
  const flags = Array.from(ADMIN_FLAGS.values());
  const filtered = status ? flags.filter(f => f.status === status) : flags;
  res.json({ flags: filtered.sort((a,b) => b.createdAt - a.createdAt) });
});

app.post('/api/admin/flags/:flagId/resolve',
  param('flagId').isString().isLength({ min:1, max:100 }),
  body('action').isIn(['dismiss','warn','suspend','ban']),
  body('notes').optional().isString().isLength({ max:1000 }),
  validate,
(req,res)=>{
  const { flagId } = req.params;
  const { action, notes } = req.body;
  const flag = ADMIN_FLAGS.get(flagId);
  if(!flag) return res.status(404).json({ error:'flag_not_found' });
  flag.status = 'resolved';
  flag.resolution = { action, notes, resolvedAt: Date.now() };
  res.json({ ok:true, flagId, resolution: flag.resolution });
});

// --- Feature 17: Agent Activity Logs ---
const ACTIVITY_LOGS = [];

function logActivity(agent, action, details, success = true){
  ACTIVITY_LOGS.push({
    timestamp: Date.now(),
    agent,
    action,
    details,
    success,
    id: nanoid(8)
  });
  // Keep only last 1000 logs
  if(ACTIVITY_LOGS.length > 1000) ACTIVITY_LOGS.shift();
}

app.get('/api/admin/activity-logs',
  query('agent').optional().isString(),
  query('limit').optional().isInt({ min:1, max:100 }),
  validate,
(req,res)=>{
  const { agent, limit = 50 } = req.query;
  let logs = [...ACTIVITY_LOGS];
  if(agent) logs = logs.filter(l => l.agent === agent);
  logs = logs.sort((a,b) => b.timestamp - a.timestamp).slice(0, limit);
  res.json({ logs, total: ACTIVITY_LOGS.length });
});

// --- Feature 18: Dynamic Onboarding Wizard ---
const ONBOARDING_FLOWS = {
  parent: [
    { step: 'welcome', title: 'Welcome Parent!', fields: ['name','email'] },
    { step: 'preferences', title: 'Care Preferences', fields: ['childAges','careType','location'] },
    { step: 'emergency', title: 'Emergency Contacts', fields: ['emergencyContacts'] },
    { step: 'payment', title: 'Payment Setup', fields: ['paymentMethod'] }
  ],
  sitter: [
    { step: 'welcome', title: 'Welcome Sitter!', fields: ['name','email','phone'] },
    { step: 'experience', title: 'Your Experience', fields: ['experience','certifications','availability'] },
    { step: 'background', title: 'Background Check', fields: ['backgroundCheck','references'] },
    { step: 'profile', title: 'Complete Profile', fields: ['bio','photo','rate'] }
  ]
};

app.get('/api/onboarding/:userType/flow',
  param('userType').isIn(['parent','sitter']),
  validate,
(req,res)=>{
  const userType = req.params.userType;
  const flow = ONBOARDING_FLOWS[userType] || [];
  res.json({ userType, steps: flow, totalSteps: flow.length });
});

app.post('/api/onboarding/progress',
  body('userType').isIn(['parent','sitter']),
  body('step').isString(),
  body('data').isObject(),
  validate,
(req,res)=>{
  const { userType, step, data } = req.body;
  const flow = ONBOARDING_FLOWS[userType];
  const stepIndex = flow.findIndex(s => s.step === step);
  const nextStep = stepIndex < flow.length - 1 ? flow[stepIndex + 1] : null;
  logActivity('OnboardingWizard', 'step_completed', { userType, step, stepIndex });
  res.json({ ok:true, currentStep: step, nextStep, progress: ((stepIndex + 1) / flow.length) * 100 });
});

// --- Feature 19: Custom Promo Code Engine ---
const PROMO_CODES = new Map();

app.post('/api/promos/create',
  body('code').isString().isLength({ min:3, max:20 }),
  body('type').isIn(['percentage','fixed']),
  body('value').isFloat({ min:0 }),
  body('maxUses').optional().isInt({ min:1 }),
  body('expiresAt').optional().isISO8601(),
  validate,
(req,res)=>{
  const { code, type, value, maxUses, expiresAt } = req.body;
  const promoId = nanoid(8);
  const promo = { promoId, code: code.toUpperCase(), type, value, maxUses, expiresAt, uses: 0, createdAt: Date.now() };
  PROMO_CODES.set(code.toUpperCase(), promo);
  res.json({ ok:true, promo });
});

app.post('/api/promos/validate',
  body('code').isString().isLength({ min:3, max:20 }),
  body('amount').isFloat({ min:0 }),
  validate,
(req,res)=>{
  const { code, amount } = req.body;
  const promo = PROMO_CODES.get(code.toUpperCase());
  if(!promo) return res.status(404).json({ error:'invalid_code' });
  if(promo.maxUses && promo.uses >= promo.maxUses) return res.status(400).json({ error:'code_expired' });
  if(promo.expiresAt && Date.now() > new Date(promo.expiresAt).getTime()) return res.status(400).json({ error:'code_expired' });

  const discount = promo.type === 'percentage' ? (amount * promo.value / 100) : promo.value;
  const finalAmount = Math.max(0, amount - discount);
  res.json({ valid:true, discount, finalAmount, code: promo.code });
});

// --- Feature 20: Referral Tree Dashboard ---
const REFERRALS = new Map();

app.post('/api/referrals/create',
  body('referrerId').isString().isLength({ min:1, max:64 }),
  body('refereeId').isString().isLength({ min:1, max:64 }),
  body('type').isIn(['parent','sitter']),
  validate,
(req,res)=>{
  const { referrerId, refereeId, type } = req.body;
  const referralId = nanoid(10);
  const referral = { referralId, referrerId, refereeId, type, status: 'pending', createdAt: Date.now(), earnings: 0 };
  REFERRALS.set(referralId, referral);
  res.json({ ok:true, referral });
});

app.get('/api/referrals/:userId/tree',
  param('userId').isString().isLength({ min:1, max:64 }),
  validate,
(req,res)=>{
  const userId = req.params.userId;
  const userReferrals = Array.from(REFERRALS.values()).filter(r => r.referrerId === userId);
  const tree = userReferrals.map(r => ({
    refereeId: r.refereeId,
    type: r.type,
    status: r.status,
    earnings: r.earnings,
    date: r.createdAt
  }));
  const totalEarnings = tree.reduce((sum, r) => sum + r.earnings, 0);
  res.json({ userId, referrals: tree, totalEarnings, totalReferrals: tree.length });
});


app.post('/api/sessions/:id/geo', (req, res) => {
  const id = req.params.id; const s = sessions.get(id);
  if(!s) return res.status(404).json({ error:'not_found' });
  const { enabled=false, radius=100, center=null } = req.body || {};
  s.geo = { enabled, radius, center };
  appendEvent(id, 'geo_update', s.geo);
  saveAll();
  broadcast(id, { type:'geo_update', sessionId:id, payload: s.geo });
  res.json({ ok:true });
});

const server = app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});

module.exports = server;

// WebSocket layer
const wss = new WebSocketServer({ server, path:'/ws' });
function verify(ws, data){
  try{
    const { sessionId, token } = data||{};
    if(!sessionId || !token) return false;
    const decoded = jwt.verify(token, JWT_SECRET);
    if(decoded.sub !== sessionId) return false;
    const current = activeJti.get(sessionId);
    return !!current && decoded.jti === current;
  }catch(_){ return false; }
}

const subs = new Map(); // sessionId -> Set(ws)

function broadcast(sessionId, message){
  const set = subs.get(sessionId); if(!set) return;
  const payload = JSON.stringify(message);
  for(const ws of set){ try{ ws.send(payload); }catch(_){} }
}

wss.on('connection', (ws) => {
  let sessionId = null;
  ws.on('message', (buf) => {
    try{
      const msg = JSON.parse(buf.toString());
      if(msg.action === 'subscribe' && msg.sessionId){
        if(!verify(ws, msg)) { ws.send(JSON.stringify({ type:'error', error:'unauthorized' })); return; }
        sessionId = msg.sessionId;
        if(!subs.has(sessionId)) subs.set(sessionId, new Set());
        subs.get(sessionId).add(ws);
        ws.send(JSON.stringify({ type:'subscribed', sessionId }));
      }
    }catch(e){ ws.send(JSON.stringify({ type:'error', error:'bad_message' })); }
  });
  ws.on('close', () => { if(sessionId && subs.has(sessionId)) subs.get(sessionId).delete(ws); });
});



// Server-side scheduler: detect missed check-ins and broadcast
setInterval(() => {
  try{
    for (const [id, s] of sessions) {
      if (!s || s.status === 'stopped') continue;
      const status = computeStatus(s);
      if (status === 'missed' && s.status !== 'missed') {
        s.status = 'missed';
        appendEvent(id, 'missed', { lastCheckInAt: s.lastCheckInAt, intervalSec: s.intervalSec });
        saveAll();
        broadcast(id, { type:'missed', sessionId:id, payload:{ lastCheckInAt: s.lastCheckInAt, intervalSec: s.intervalSec } });
      }
    }
  } catch (e) {
    // swallow scheduler errors to avoid crashing mock server
  }
}, 1000);

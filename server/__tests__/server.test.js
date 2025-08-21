const http = require('http');
const supertest = require('supertest');
const WebSocket = require('ws');

let server;
let baseUrl = 'http://localhost:4001';
let request;

// spin up a separate instance on 4001 for tests by temporarily overriding PORT
beforeAll(async () => {
  process.env.PORT = '4001';
  delete require.cache[require.resolve('../src/index.js')];
  server = require('../src/index.js');
  // index exports nothing; it starts the server. We'll create request against baseUrl
  request = supertest(baseUrl);
});

afterAll(async () => {
  try { server && server.close && server.close(); } catch(_) {}
});

function wsSubscribe(token, sessionId){
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:4001/ws');
    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', sessionId, token }));
    });
    ws.on('message', (buf) => {
      try {
        const msg = JSON.parse(buf.toString());
        if(msg.type === 'subscribed') resolve(ws);
        else if(msg.type === 'error') reject(new Error(msg.error));
      } catch (e) { reject(e); }
    });
    ws.on('error', reject);
  });
}

describe('Mock server basic flows', () => {
  test('start session, get token, subscribe, status/check-in/stop/events', async () => {
    const startRes = await request
      .post('/api/sessions/start')
      .send({ intervalSec: 3, graceSec: 2 });
    expect(startRes.status).toBe(200);
    const { sessionId, token } = startRes.body;
    expect(sessionId).toBeTruthy();
    expect(token).toBeTruthy();

    // WS subscribe
    const ws = await wsSubscribe(token, sessionId);

    // status
    const status1 = await request.get(`/api/sessions/${sessionId}/status`);
    expect(status1.status).toBe(200);

    // check-in
    const ci = await request.post(`/api/sessions/${sessionId}/check-in`).send({});
    expect(ci.status).toBe(200);

    // events should include check-in (give a moment for scheduler/broadcast)
    const events1 = await request.get(`/api/sessions/${sessionId}/events`);
    expect(events1.status).toBe(200);

    // wait enough for missed to trigger
    await new Promise(r => setTimeout(r, 6000));

    const events2 = await request.get(`/api/sessions/${sessionId}/events`);
    expect(events2.status).toBe(200);
    const types = (events2.body.events||[]).map(e=>e.type);
    expect(types).toContain('missed');

    // stop
    const stop = await request.post(`/api/sessions/${sessionId}/stop`).send({});
    expect(stop.status).toBe(200);

    try { ws.close(); } catch(_) {}
  });
});


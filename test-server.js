const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  const url = req.url;
  
  if (url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok', message: 'NannyRadar Backend is running!' }));
  } else if (url === '/api/auth/signup') {
    res.end(JSON.stringify({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: 1, email: 'test@example.com', role: 'parent' }
    }));
  } else if (url === '/api/auth/login') {
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: { id: 1, email: 'test@example.com', role: 'parent' }
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 NannyRadar Test Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Auth test page: file:///h:/bidayax-project-ng/babysitting app/test-auth.html`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1, '127.0.0.1');
  }
});

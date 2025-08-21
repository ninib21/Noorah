# NannyRadar Mock Backend (Node/Express + WebSocket)

This is a minimal backend scaffold to support sessions, trusted sharing, and geo-fence events. It is designed for local development and easy replacement with a production stack later.

## Features
- REST endpoints
  - POST /api/sessions/start
  - POST /api/sessions/:id/check-in
  - POST /api/sessions/:id/stop
  - GET  /api/sessions/:id/status
  - POST /api/sessions/:id/share
  - POST /api/sessions/:id/geo
- WebSocket channel
  - Subscribe to a session and receive events: start, check-in, missed, stop, share_update, geo_update, geofence_breach
- In-memory store (no database) with graceful code structure for later swap

## Quick start

1) Initialize and install dependencies (Node 18+)

   npm init -y
   npm install express cors ws nanoid

2) Run the server

   node src/index.js

   (or) nodemon src/index.js

3) Configure the frontend to use the server (optional toggle)
- In nannyradar-mobile-ui.html, set NR_Config.useServer = true and NR_Config.serverBaseUrl = 'http://localhost:4000'
- The current UI still works without the server; this server is for the smooth flip to real APIs.

## API

- POST /api/sessions/start
  Body: { bookingId, sitterId, parentId, intervalSec }
  Returns: { sessionId, startedAt, intervalSec, status }

- POST /api/sessions/:id/check-in
  Returns: { ok: true, lastCheckInAt, status }

- POST /api/sessions/:id/stop
  Returns: { ok: true, status: 'stopped' }

- GET /api/sessions/:id/status
  Returns: { sessionId, status: 'ontrack'|'missed'|'stopped', countdownSec, lastCheckInAt, intervalSec }

- POST /api/sessions/:id/share
  Body: { contacts: [{ contact: string }] }
  Returns: { ok: true }

- POST /api/sessions/:id/geo
  Body: { enabled: boolean, radius: number, center: { lat, lon } }
  Returns: { ok: true }

## WebSocket
Connect to ws://localhost:4000/ws

Send: { action: 'subscribe', sessionId }
Receive: { type, sessionId, payload }

Types: start, check-in, missed, stop, share_update, geo_update, geofence_breach

## Notes
- This is a dev mock. Data resets on server restart.
- For production, replace the in-memory store with a database and move timers to the server for authoritative status.


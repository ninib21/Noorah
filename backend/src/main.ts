import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function isAllowed(origin?: string) {
  if (!origin) return true; // curl/postman
  const allow = [
    /^http:\/\/localhost(?::\d+)?$/,
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
    /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/, // local LAN
    'null', // file:// origin
  ];
  return allow.some(a => (a instanceof RegExp ? a.test(origin) : a === origin));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: (origin, cb) => (isAllowed(origin) ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`))),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false,
    maxAge: 86400,
  });

  app.setGlobalPrefix('api/v1');

  // Built-in health endpoints (no controllers needed)
  const express = app.getHttpAdapter().getInstance();
  express.get('/', (_req: any, res: any) => res.json({ ok: true, service: 'Noorah-backend' }));
  express.get('/health', (_req: any, res: any) => res.json({ ok: true, status: 'healthy' }));
  express.get('/api/v1/health', (_req: any, res: any) =>
    res.json({ ok: true, status: 'healthy', scope: 'api/v1' })
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Backend listening on http://localhost:${port}`);
}
bootstrap(); 


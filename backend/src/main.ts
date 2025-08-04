import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS with proper configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:19006',
      'http://localhost:8081',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe with enhanced configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('NannyRadar API')
    .setDescription('The NannyRadar babysitting app API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('bookings', 'Booking system')
    .addTag('payments', 'Payment processing')
    .addTag('sitters', 'Sitter management')
    .addTag('reviews', 'Review system')
    .addTag('ai', 'AI features')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 NannyRadar API is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 
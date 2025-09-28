import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Core security services
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityMiddleware } from './security-middleware';
import { SecurityGuard } from './security.guard';
import { QuantumSecurityService } from './quantum-security.service';

// Entities
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SecurityController],
  providers: [
    // Core security services
    SecurityService,
    SecurityMiddleware,
    SecurityGuard,
    QuantumSecurityService,

    // Global security guard
    {
      provide: APP_GUARD,
      useClass: SecurityGuard,
    },
  ],
  exports: [
    // Core exports
    SecurityService,
    SecurityMiddleware,
    QuantumSecurityService,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}


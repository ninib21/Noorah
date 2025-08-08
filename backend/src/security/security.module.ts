import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityMiddleware } from './security-middleware';
import { SecurityGuard } from './security.guard';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    SecurityMiddleware,
    {
      provide: APP_GUARD,
      useClass: SecurityGuard,
    },
  ],
  exports: [SecurityService, SecurityMiddleware],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Core security services
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityMiddleware } from './security-middleware';
import { SecurityGuard } from './security.guard';

// Advanced security services
import { QuantumSecurityService } from './quantum-security.service';
// import { ZeroTrustService } from './zero-trust.service';
// import { AIThreatDetectionService } from './ai-threat-detection.service';
// import { CyberHygieneService } from './cyber-hygiene.service';
// import { IncidentResponseService } from './incident-response.service';
// import { SecurityMonitoringService } from './security-monitoring.service';
// import { ComplianceAuditService } from './compliance-audit.service';

// Entities
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    ConfigModule,
    ScheduleModule.forRoot(),
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
    
    // Advanced security services
    QuantumSecurityService,
    // ZeroTrustService,
    // AIThreatDetectionService,
    // CyberHygieneService,
    // IncidentResponseService,
    // SecurityMonitoringService,
    // ComplianceAuditService,
    
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
    
    // Advanced security exports
    QuantumSecurityService,
    // ZeroTrustService,
    // AIThreatDetectionService,
    // CyberHygieneService,
    // IncidentResponseService,
    // SecurityMonitoringService,
    // ComplianceAuditService,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}

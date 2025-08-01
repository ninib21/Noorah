import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { LoggingService } from './logging.service';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [LoggingService, MetricsService],
  exports: [LoggingService, MetricsService],
})
export class MonitoringModule {} 
import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { MetricsService } from './metrics.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [LoggingService, MetricsService],
  exports: [LoggingService, MetricsService],
})
export class MonitoringModule {} 

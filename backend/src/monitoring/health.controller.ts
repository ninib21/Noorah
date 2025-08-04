import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
} 
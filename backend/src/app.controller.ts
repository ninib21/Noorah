import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information retrieved successfully' })
  getApiInfo() {
    return {
      message: 'Welcome to Noorah API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/v1/health',
        docs: '/api/docs',
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        sitters: '/api/v1/sitters',
        bookings: '/api/v1/bookings',
        payments: '/api/v1/payments',
        ai: '/api/v1/ai',
        search: '/api/v1/search',
        enterprise: '/api/v1/enterprise',
      },
      features: [
        'Authentication & Authorization',
        'Sitter Management',
        'Booking System',
        'Payment Processing (Stripe)',
        'AI-Powered Matching',
        'GPS Tracking & Emergency SOS',
        'Real-time Notifications',
        'Enterprise Features',
        'Security & Compliance',
      ],
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'API status retrieved successfully' })
  getStatus() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}


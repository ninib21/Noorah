import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SecurityService } from './security.service';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('health')
  @ApiOperation({ summary: 'Security health check' })
  @ApiResponse({ status: 200, description: 'Security service is healthy' })
  async healthCheck(): Promise<{ status: string }> {
    return { status: 'healthy' };
  }

  @Post('validate-api-key')
  @ApiOperation({ summary: 'Validate API key' })
  @ApiResponse({ status: 200, description: 'API key validation result' })
  async validateApiKey(@Body() body: { apiKey: string }): Promise<{ valid: boolean }> {
    const valid = await this.securityService.validateApiKey(body.apiKey);
    return { valid };
  }
} 
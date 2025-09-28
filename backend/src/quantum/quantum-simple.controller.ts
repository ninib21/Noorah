import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuantumSimpleService } from './quantum-simple.service';

/**
 * Simplified Quantum Controller
 * 
 * Provides API endpoints for quantum computing features
 */
@ApiTags('quantum')
@Controller('quantum')
export class QuantumSimpleController {
  constructor(private readonly quantumService: QuantumSimpleService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Quantum System Status' })
  @ApiResponse({ status: 200, description: 'Quantum system status retrieved' })
  async getQuantumSystemStatus() {
    return this.quantumService.getQuantumSystemStatus();
  }

  @Post('sitter-matching')
  @ApiOperation({ summary: 'Execute Quantum Sitter Matching' })
  @ApiBody({
    description: 'Sitter matching parameters',
    schema: {
      type: 'object',
      properties: {
        sitters: { type: 'array' },
        parents: { type: 'array' },
        preferences: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Quantum sitter matching completed' })
  async quantumSitterMatching(@Body() data: any) {
    return this.quantumService.quantumSitterMatching(
      data.sitters,
      data.parents,
      data.preferences
    );
  }

  @Post('generate-key')
  @ApiOperation({ summary: 'Generate Quantum Key' })
  @ApiBody({
    description: 'Key generation parameters',
    schema: {
      type: 'object',
      properties: {
        keyLength: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Quantum key generated' })
  async generateQuantumKey(@Body() data: any) {
    return this.quantumService.generateQuantumKey(data.keyLength || 256);
  }

  @Post('analytics')
  @ApiOperation({ summary: 'Execute Quantum Analytics' })
  @ApiBody({
    description: 'Data for analysis',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        analysisType: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Quantum analytics completed' })
  async quantumAnalytics(@Body() data: any) {
    return this.quantumService.quantumAnalytics(data.data, data.analysisType);
  }

  @Post('optimization')
  @ApiOperation({ summary: 'Execute Quantum Optimization' })
  @ApiBody({
    description: 'Optimization problem',
    schema: {
      type: 'object',
      properties: {
        problem: { type: 'object' },
        algorithm: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Quantum optimization completed' })
  async quantumOptimization(@Body() data: any) {
    return this.quantumService.quantumOptimization(data.problem, data.algorithm);
  }

  @Post('communication')
  @ApiOperation({ summary: 'Execute Quantum Communication' })
  @ApiBody({
    description: 'Communication parameters',
    schema: {
      type: 'object',
      properties: {
        senderId: { type: 'string' },
        receiverId: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Quantum communication established' })
  async quantumCommunication(@Body() data: any) {
    return this.quantumService.quantumCommunication(
      data.senderId,
      data.receiverId,
      data.message
    );
  }
}


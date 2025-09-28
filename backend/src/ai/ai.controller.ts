import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AIService, AISitterMatchRequest, AIBookingRecommendationRequest } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('sitter-match')
  @ApiOperation({ summary: 'Find best sitter matches using AI' })
  @ApiResponse({
    status: 200,
    description: 'Sitter matches found successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  async findSitterMatches(
    @Request() req,
    @Body() request: AISitterMatchRequest,
  ) {
    return this.aiService.findSitterMatches(request);
  }

  @Post('booking-recommendations')
  @ApiOperation({ summary: 'Generate booking recommendations using AI' })
  @ApiResponse({
    status: 200,
    description: 'Booking recommendations generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  async generateBookingRecommendations(
    @Request() req,
    @Body() request: AIBookingRecommendationRequest,
  ) {
    return this.aiService.generateBookingRecommendations(request);
  }

  @Post('match-outcome')
  @ApiOperation({ summary: 'Record match outcome for AI learning' })
  @ApiResponse({
    status: 200,
    description: 'Match outcome recorded successfully',
  })
  async recordMatchOutcome(
    @Request() req,
    @Body() body: {
      sitterId: string;
      childId: string;
      success: boolean;
      rating?: number;
    },
  ) {
    return this.aiService.recordMatchOutcome(
      body.sitterId,
      body.childId,
      body.success,
      body.rating,
    );
  }

  @Post('recommendation-feedback')
  @ApiOperation({ summary: 'Record recommendation feedback for AI learning' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation feedback recorded successfully',
  })
  async recordRecommendationFeedback(
    @Request() req,
    @Body() body: {
      recommendationId: string;
      action: 'accepted' | 'rejected' | 'modified';
      feedback?: string;
    },
  ) {
    return this.aiService.recordRecommendationFeedback(
      req.user.id,
      body.recommendationId,
      body.action,
      body.feedback,
    );
  }

  @Get('insights/:userId')
  @ApiOperation({ summary: 'Get AI insights for a user' })
  @ApiResponse({
    status: 200,
    description: 'AI insights retrieved successfully',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUserInsights(@Param('userId') userId: string) {
    return this.aiService.getUserInsights(userId);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get AI insights for current user' })
  @ApiResponse({
    status: 200,
    description: 'AI insights retrieved successfully',
  })
  async getCurrentUserInsights(@Request() req) {
    return this.aiService.getUserInsights(req.user.id);
  }

  @Get('sitter-recommendations/:childId')
  @ApiOperation({ summary: 'Get sitter recommendations for a specific child' })
  @ApiResponse({
    status: 200,
    description: 'Sitter recommendations retrieved successfully',
  })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations to return' })
  async getSitterRecommendations(
    @Param('childId') childId: string,
    @Query('limit') limit: number = 5,
  ) {
    // This would call the sitter match service directly
    // For now, return a mock response
    return {
      childId,
      recommendations: [
        {
          sitterId: 'sitter1',
          name: 'Sarah Johnson',
          rating: 4.9,
          matchScore: 95,
          reasons: ['Excellent temperament match', 'Perfect availability'],
          distance: 2.3,
        },
        {
          sitterId: 'sitter3',
          name: 'Emma Rodriguez',
          rating: 4.8,
          matchScore: 92,
          reasons: ['Previously worked with your family', 'Highly experienced'],
          distance: 3.1,
        },
      ],
    };
  }
} 

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SittersService } from './sitters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateSitterProfileDto,
  UpdateSitterProfileDto,
  SitterSearchDto,
  AvailabilityDto,
} from './dto/sitter.dto';

@ApiTags('Sitters')
@Controller('sitters')
export class SittersController {
  constructor(private readonly sittersService: SittersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for available sitters' })
  @ApiResponse({
    status: 200,
    description: 'Sitters found successfully',
  })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'time', required: false, type: String })
  @ApiQuery({ name: 'duration', required: false, type: Number })
  @ApiQuery({ name: 'maxRate', required: false, type: Number })
  @ApiQuery({ name: 'skills', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchSitters(@Query() searchDto: SitterSearchDto) {
    return this.sittersService.searchSitters(searchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sitters (with filters)' })
  @ApiResponse({
    status: 200,
    description: 'Sitters retrieved successfully',
  })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  @ApiQuery({ name: 'available', required: false, type: Boolean })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllSitters(@Query() filters: any) {
    return this.sittersService.getAllSitters(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sitter profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sitter profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sitter not found',
  })
  @ApiParam({ name: 'id', description: 'Sitter ID' })
  async getSitterProfile(@Param('id') id: string) {
    return this.sittersService.getSitterProfile(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get sitter reviews' })
  @ApiResponse({
    status: 200,
    description: 'Sitter reviews retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Sitter ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSitterReviews(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.sittersService.getSitterReviews(id, page, limit);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get sitter availability' })
  @ApiResponse({
    status: 200,
    description: 'Sitter availability retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Sitter ID' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getSitterAvailability(
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.sittersService.getSitterAvailability(id, date);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sitter profile' })
  @ApiResponse({
    status: 201,
    description: 'Sitter profile created successfully',
  })
  async createSitterProfile(
    @Request() req,
    @Body() createSitterProfileDto: CreateSitterProfileDto,
  ) {
    return this.sittersService.createSitterProfile(req.user.id, createSitterProfileDto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sitter profile' })
  @ApiResponse({
    status: 200,
    description: 'Sitter profile updated successfully',
  })
  async updateSitterProfile(
    @Request() req,
    @Body() updateSitterProfileDto: UpdateSitterProfileDto,
  ) {
    return this.sittersService.updateSitterProfile(req.user.id, updateSitterProfileDto);
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sitter availability' })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  async updateAvailability(
    @Request() req,
    @Body() availabilityDto: AvailabilityDto,
  ) {
    return this.sittersService.updateAvailability(req.user.id, availabilityDto);
  }

  @Put('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sitter availability status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  async updateStatus(
    @Request() req,
    @Body() { isAvailable }: { isAvailable: boolean },
  ) {
    return this.sittersService.updateStatus(req.user.id, isAvailable);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user sitter profile' })
  @ApiResponse({
    status: 200,
    description: 'Sitter profile retrieved successfully',
  })
  async getMySitterProfile(@Request() req) {
    return this.sittersService.getMySitterProfile(req.user.id);
  }

  @Get('earnings/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sitter earnings summary' })
  @ApiResponse({
    status: 200,
    description: 'Earnings summary retrieved successfully',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  async getEarningsSummary(
    @Request() req,
    @Query('period') period: string = 'month',
  ) {
    return this.sittersService.getEarningsSummary(req.user.id, period);
  }

  @Get('bookings/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sitter booking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Booking statistics retrieved successfully',
  })
  async getBookingStats(@Request() req) {
    return this.sittersService.getBookingStats(req.user.id);
  }

  @Post('background-check/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request background check' })
  @ApiResponse({
    status: 200,
    description: 'Background check requested successfully',
  })
  async requestBackgroundCheck(@Request() req) {
    return this.sittersService.requestBackgroundCheck(req.user.id);
  }

  @Get('background-check/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get background check status' })
  @ApiResponse({
    status: 200,
    description: 'Background check status retrieved successfully',
  })
  async getBackgroundCheckStatus(@Request() req) {
    return this.sittersService.getBackgroundCheckStatus(req.user.id);
  }

  @Post('certifications/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload certification document' })
  @ApiResponse({
    status: 201,
    description: 'Certification uploaded successfully',
  })
  async uploadCertification(
    @Request() req,
    @Body() certificationData: { name: string; fileUrl: string; expiryDate?: string },
  ) {
    return this.sittersService.uploadCertification(req.user.id, certificationData);
  }

  @Get('certifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sitter certifications' })
  @ApiResponse({
    status: 200,
    description: 'Certifications retrieved successfully',
  })
  async getCertifications(@Request() req) {
    return this.sittersService.getCertifications(req.user.id);
  }

  @Delete('certifications/:certId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove certification' })
  @ApiResponse({
    status: 204,
    description: 'Certification removed successfully',
  })
  @ApiParam({ name: 'certId', description: 'Certification ID' })
  async removeCertification(@Param('certId') certId: string, @Request() req) {
    return this.sittersService.removeCertification(req.user.id, certId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby sitters' })
  @ApiResponse({
    status: 200,
    description: 'Nearby sitters retrieved successfully',
  })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  async getNearbySitters(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
  ) {
    return this.sittersService.getNearbySitters(latitude, longitude, radius);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured sitters' })
  @ApiResponse({
    status: 200,
    description: 'Featured sitters retrieved successfully',
  })
  async getFeaturedSitters() {
    return this.sittersService.getFeaturedSitters();
  }
} 

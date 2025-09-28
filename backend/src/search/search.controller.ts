import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService, SearchFilters } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('sitters')
  async searchSitters(
    @Query('q') query: string = '',
    @Query('location') location?: string,
    @Query('radius') radius?: number,
    @Query('minRating') minRating?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('skills') skills?: string,
    @Query('languages') languages?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const filters: SearchFilters = {
      location,
      radius,
      minRating,
      maxPrice,
      skills: skills ? skills.split(',') : undefined,
      languages: languages ? languages.split(',') : undefined,
    };

    return this.searchService.searchSitters(query, filters, page, limit);
  }

  @Get('sitters/popular')
  async getPopularSitters(@Query('limit') limit: number = 10) {
    return this.searchService.getPopularSitters(limit);
  }

  @Get('sitters/nearby')
  async getNearbySitters(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('limit') limit: number = 20,
  ) {
    return this.searchService.getNearbySitters(latitude, longitude, radius, limit);
  }
} 

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';

export interface SearchFilters {
  location?: string;
  radius?: number;
  minRating?: number;
  maxPrice?: number;
  availability?: string[];
  skills?: string[];
  languages?: string[];
}

export interface SearchResult {
  id: string;
  name: string;
  rating: number;
  hourlyRate: number;
  location: string;
  distance: number;
  skills: string[];
  availability: any;
  imageUrl?: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
  ) {}

  async searchSitters(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ results: SearchResult[]; total: number; page: number; totalPages: number }> {
    try {
      const queryBuilder = this.sitterProfileRepository
        .createQueryBuilder('sitter')
        .leftJoinAndSelect('sitter.user', 'user')
        .where('user.userType = :userType', { userType: 'SITTER' });

      // Apply text search
      if (query) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR sitter.bio ILIKE :query)',
          { query: `%${query}%` },
        );
      }

      // Apply location filter
      if (filters.location) {
        queryBuilder.andWhere('sitter.location ILIKE :location', {
          location: `%${filters.location}%`,
        });
      }

      // Apply rating filter
      if (filters.minRating) {
        queryBuilder.andWhere('sitter.averageRating >= :minRating', {
          minRating: filters.minRating,
        });
      }

      // Apply price filter
      if (filters.maxPrice) {
        queryBuilder.andWhere('sitter.hourlyRate <= :maxPrice', {
          maxPrice: filters.maxPrice,
        });
      }

      // Apply skills filter
      if (filters.skills && filters.skills.length > 0) {
        queryBuilder.andWhere('sitter.skills && :skills', {
          skills: filters.skills,
        });
      }

      // Apply languages filter
      if (filters.languages && filters.languages.length > 0) {
        queryBuilder.andWhere('sitter.languages && :languages', {
          languages: filters.languages,
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder
        .orderBy('sitter.averageRating', 'DESC')
        .addOrderBy('sitter.totalReviews', 'DESC')
        .skip(offset)
        .take(limit);

      const sitters = await queryBuilder.getMany();

      const results: SearchResult[] = sitters.map((sitter) => ({
        id: sitter.id,
        name: `${sitter.user.firstName} ${sitter.user.lastName}`,
        rating: sitter.averageRating || 0,
        hourlyRate: sitter.hourlyRate,
        location: sitter.location || '',
        distance: 0, // Will be calculated if needed
        skills: sitter.skills ? JSON.parse(sitter.skills) : [],
        availability: sitter.availability ? JSON.parse(sitter.availability) : [],
        imageUrl: sitter.profileImageUrl,
      }));

      return {
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  async getPopularSitters(limit: number = 10): Promise<SearchResult[]> {
    try {
      const sitters = await this.sitterProfileRepository
        .createQueryBuilder('sitter')
        .leftJoinAndSelect('sitter.user', 'user')
        .where('user.userType = :userType', { userType: 'SITTER' })
        .orderBy('sitter.averageRating', 'DESC')
        .addOrderBy('sitter.totalReviews', 'DESC')
        .limit(limit)
        .getMany();

      return sitters.map((sitter) => ({
        id: sitter.id,
        name: `${sitter.user.firstName} ${sitter.user.lastName}`,
        rating: sitter.averageRating || 0,
        hourlyRate: sitter.hourlyRate,
        location: sitter.location || '',
        distance: 0,
        skills: sitter.skills ? JSON.parse(sitter.skills) : [],
        availability: sitter.availability ? JSON.parse(sitter.availability) : [],
        imageUrl: sitter.profileImageUrl,
      }));
    } catch (error) {
      console.error('Get popular sitters error:', error);
      return [];
    }
  }

  async getNearbySitters(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit: number = 20,
  ): Promise<SearchResult[]> {
    try {
      const sitters = await this.sitterProfileRepository
        .createQueryBuilder('sitter')
        .leftJoinAndSelect('sitter.user', 'user')
        .where('user.userType = :userType', { userType: 'SITTER' })
        .getMany();

      const nearbySitters = sitters
        .filter((sitter) => {
          // For now, return all sitters since we don't have location data
          // In production, you'd filter by actual coordinates
          return true;
        })
        .sort((a, b) => {
          // Sort by rating for now
          return (b.averageRating || 0) - (a.averageRating || 0);
        })
        .slice(0, limit);

      return nearbySitters.map((sitter) => ({
        id: sitter.id,
        name: `${sitter.user.firstName} ${sitter.user.lastName}`,
        rating: sitter.averageRating || 0,
        hourlyRate: sitter.hourlyRate,
        location: sitter.location || '',
        distance: 0, // Would be calculated in production
        skills: sitter.skills ? JSON.parse(sitter.skills) : [],
        availability: sitter.availability ? JSON.parse(sitter.availability) : [],
        imageUrl: sitter.profileImageUrl,
      }));
    } catch (error) {
      console.error('Get nearby sitters error:', error);
      return [];
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 

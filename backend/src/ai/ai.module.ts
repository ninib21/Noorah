import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { SitterMatchService } from './sitter-match.service';
import { BookingRecommenderService } from './booking-recommender.service';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { Booking } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SitterProfile, Booking, Review]),
  ],
  controllers: [AIController],
  providers: [AIService, SitterMatchService, BookingRecommenderService],
  exports: [AIService, SitterMatchService, BookingRecommenderService],
})
export class AIModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SittersController } from './sitters.controller';
import { SittersService } from './sitters.service';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitterProfile, User, Booking, Review])],
  controllers: [SittersController],
  providers: [SittersService],
  exports: [SittersService],
})
export class SittersModule {} 

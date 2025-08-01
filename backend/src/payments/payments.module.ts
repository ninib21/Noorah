import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../entities/payment.entity';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Booking, User, SitterProfile]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {} 
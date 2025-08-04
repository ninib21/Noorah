import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SittersController } from './sitters.controller';
import { SittersService } from './sitters.service';
import { SitterProfile } from '../entities/sitter-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitterProfile])],
  controllers: [SittersController],
  providers: [SittersService],
  exports: [SittersService],
})
export class SittersModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SitterProfile])],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {} 
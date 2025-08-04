import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserType {
  PARENT = 'PARENT',
  SITTER = 'SITTER',
  ADMIN = 'ADMIN',
}

export class SearchUsersDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'User type filter' })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;
} 
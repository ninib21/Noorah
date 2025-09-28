import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('CACHE_TTL', 3600), // 1 hour default
        max: configService.get('CACHE_MAX_ITEMS', 1000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {} 

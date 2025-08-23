import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './database/redis.module';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { WinstonLoggerService } from './logger/winston.config';
import { CacheService } from './services/cache.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  imports: [ConfigModule, RedisModule],
  providers: [
    WinstonLoggerService,
    RequestIdInterceptor,
    EmailService,
    CacheService,
  ],
  exports: [
    WinstonLoggerService,
    RequestIdInterceptor,
    EmailService,
    CacheService,
  ],
})
export class CommonModule { }

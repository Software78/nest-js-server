import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { WinstonLoggerService } from './logger/winston.config';
import { EmailService } from './services/email.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    WinstonLoggerService,
    RequestIdInterceptor,
    EmailService,
  ],
  exports: [
    WinstonLoggerService,
    RequestIdInterceptor,
    EmailService,
  ],
})
export class CommonModule {}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '../../entities/otp.entity';
import { User } from '../../entities/user.entity';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    // PostgreSQL with TypeORM
    ...(process.env.SKIP_DB !== 'true'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: configService.get<number>('DB_PORT', 5432),
              username: configService.get<string>('DB_USERNAME', 'postgres'),
              password: configService.get<string>('DB_PASSWORD', 'postgres'),
              database: configService.get<string>('DB_NAME', 'nestjs_db'),
              entities: [User, Otp],
              synchronize:
                configService.get<string>('NODE_ENV') === 'development',
              logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
          }),
        ]
      : []),

    // MongoDB with Mongoose (available for internal use)
    ...(process.env.SKIP_MONGO !== 'true'
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>(
                'MONGO_URI',
                'mongodb://localhost:27017/nestjs_db',
              ),
              dbName: configService.get<string>('MONGO_DB_NAME', 'nestjs_db'),
            }),
            inject: [ConfigService],
          }),
        ]
      : []),

    // Redis
    RedisModule,
  ],
})
export class DatabaseModule {}

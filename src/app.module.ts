import { createPinoLoggerModule, createTypeOrmModule } from '@cliplink/utils';
import { NatsModule } from '@cliplink/utils';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfig } from './_common/types/app-config.type';
import { ClicksModule } from './clicks/clicks.module';
import { ClickEntity } from './clicks/dao/click.entity';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('databaseConnectionOptions'),
        entities: [ClickEntity],
        migrations: [], // Migrations will be run separately
      }),
    }),
    createTypeOrmModule<AppConfig>('databaseConnectionOptions'),
    createPinoLoggerModule(),
    NatsModule,
    ClicksModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClicksModule } from './clicks/clicks.module';
import config from './config';
import { ClickEntity } from './clicks/dao/click.entity';

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
    ClicksModule,
  ],
})
export class AppModule {}
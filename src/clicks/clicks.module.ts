import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClicksConsumerService } from './clicks-consumer.service';
import { ClicksService } from './clicks.service';
import { ClickEntity } from './dao/click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClickEntity])],
  providers: [ClicksService, ClicksConsumerService],
})
export class ClicksModule {}

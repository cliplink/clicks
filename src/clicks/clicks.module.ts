import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClicksController } from './clicks.controller';
import { ClicksService } from './clicks.service';
import { ClickEntity } from './dao/click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClickEntity])],
  controllers: [ClicksController],
  providers: [ClicksService],
})
export class ClicksModule {}

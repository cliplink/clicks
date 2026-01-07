import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClickCreatedEvent } from '../_contracts';
import { ClickEntity } from './dao/click.entity';

// TODO: move to env config
const FLUSH_INTERVAL_MS = 5000;
const BATCH_SIZE = 100;

@Injectable()
export class ClicksService implements OnModuleInit, OnModuleDestroy {
  private clickBuffer: ClickCreatedEvent[] = [];
  private flushInterval: NodeJS.Timeout;

  private logger = new Logger(ClicksService.name);

  constructor(
    @InjectRepository(ClickEntity)
    private clicksRepository: Repository<ClickEntity>,
  ) {}

  onModuleInit() {
    this.flushInterval = setInterval(
      () => this.flushBuffer(),
      FLUSH_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    clearInterval(this.flushInterval);
    this.flushBuffer().then();
  }

  public addClick(clickEvent: ClickCreatedEvent) {
    this.clickBuffer.push(clickEvent);
    if (this.clickBuffer.length >= BATCH_SIZE) {
      this.flushBuffer().then();
    }
  }

  private async flushBuffer() {
    if (this.clickBuffer.length === 0) {
      return;
    }

    const clicksToSave = [...this.clickBuffer];
    this.clickBuffer = [];

    const clickEntities = clicksToSave.map((event) => {
      const click = new ClickEntity();
      click.linkId = event.linkId;
      click.occurredAt = new Date(event.occurredAt);
      click.ipHash = event.ipHash ?? null;
      click.userAgent = event.userAgent ?? null;
      click.referer = event.referer ?? null;
      click.country = event.country ?? null;
      click.forwardedFor = event.forwardedFor ?? null;
      return click;
    });

    try {
      await this.clicksRepository.save(clickEntities);
      this.logger.log(
        `Successfully saved ${clickEntities.length} clicks to the database.`,
      );
    } catch (error) {
      this.logger.error('Failed to save clicks to the database:', error);
      // re-add failed clicks to the buffer
      this.clickBuffer.push(...clicksToSave);
    }
  }
}

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClickCreatedEvent } from '../_contracts';
import { ClickEntity } from './dao/click.entity';

const FLUSH_INTERVAL_MS = 5000; // 5 seconds
const BATCH_SIZE = 100;

@Injectable()
export class ClicksService implements OnModuleInit, OnModuleDestroy {
  private clickBuffer: ClickCreatedEvent[] = [];
  private flushInterval: NodeJS.Timeout;

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
    // Ensure any remaining clicks are flushed before shutdown
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
      console.log(
        `Successfully saved ${clickEntities.length} clicks to the database.`,
      );
    } catch (error) {
      console.error('Failed to save clicks to the database:', error);
      // Optionally, re-add failed clicks to the buffer or a dead-letter queue
      this.clickBuffer.push(...clicksToSave);
    }
  }
}

import { AckPolicy, jetstream, jetstreamManager } from '@nats-io/jetstream';
import type { NatsConnection } from '@nats-io/nats-core';
import { Logger } from '@nestjs/common';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ClicksService } from './clicks.service';
import { AppConfig } from '../_common/types/app-config.type';
import { ClickCreatedEvent } from '../_contracts';
import { NATS_CONNECTION_SERVICE } from '../nats/constants';

@Injectable()
export class ClicksConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClicksConsumerService.name);
  private running = true;

  constructor(
    private readonly configService: ConfigService,
    @Inject(NATS_CONNECTION_SERVICE) private readonly nc: NatsConnection,
    private clicksService: ClicksService,
  ) {}

  async onModuleInit() {
    const stream = process.env.NATS_STREAM_NAME as string;
    const durable = `${this.configService.getOrThrow<AppConfig>('appName')}_${ClicksConsumerService.name}`;

    const jsm = await jetstreamManager(this.nc);

    await jsm.consumers
      .add(stream, {
        durable_name: durable,
        ack_policy: AckPolicy.Explicit,
        filter_subject: 'click.*',
        deliver_policy: 'all',
      })
      .catch(() => {
        this.logger.log('JetStream Clicks consumer already exists');
      });

    const jetStreamClient = jetstream(this.nc);

    const consumer = await jetStreamClient.consumers.get(stream, durable);

    this.logger.log('JetStream Clicks consumer started');

    while (this.running) {
      const msg = await consumer.next({ expires: 1000 });
      if (!msg) continue;

      try {
        const data = msg.json() as ClickCreatedEvent;
        console.log('click event:', data);

        this.clicksService.addClick(data);

        msg.ack();
      } catch (err) {
        this.logger.error('error processing message', err);
      }
    }
  }

  async onModuleDestroy() {
    this.running = false;
    await this.nc.drain();
  }
}

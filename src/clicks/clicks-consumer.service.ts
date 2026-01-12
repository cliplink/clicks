import { NATS_CONNECTION_SERVICE } from '@cliplink/utils';
import {
  AckPolicy,
  ConsumerInfo,
  jetstream,
  jetstreamManager,
  type JetStreamManager,
} from '@nats-io/jetstream';
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
import { CLICK_CREATED_SUBJECT, ClickCreatedEvent } from '../_contracts';

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
    const stream = this.configService.getOrThrow<string>('nats.streamName');
    const durable = `${this.configService.getOrThrow<AppConfig>('appName')}_${ClicksConsumerService.name}`;

    const jsm = await jetstreamManager(this.nc);

    await this.createStream(jsm, stream);

    await this.createConsumer(jsm, stream, durable);

    const jetStreamClient = jetstream(this.nc);

    const consumer = await jetStreamClient.consumers.get(stream, durable);

    this.logger.log('JetStream Clicks consumer started');

    while (this.running) {
      const msg = await consumer.next({ expires: 1000 });
      if (!msg) continue;

      try {
        const data = msg.json() as ClickCreatedEvent;

        this.clicksService.addClick(data);

        msg.ack();
      } catch (err) {
        this.logger.error('error processing message', err);
        msg.term();
      }
    }
  }

  private async createStream(jsm: JetStreamManager, stream: string) {
    try {
      await jsm.streams.add({
        name: stream,
        subjects: [CLICK_CREATED_SUBJECT],
      });

      this.logger.debug(`Stream created: ${stream}`);
    } catch (err: unknown) {
      const e = err as { message: string };
      this.logger.warn(`Stream creation/update warning: ${e.message}`);
    }
  }

  private async createConsumer(
    jsm: JetStreamManager,
    stream: string,
    durable: string,
  ): Promise<ConsumerInfo | undefined> {
    try {
      const consumerInfo = jsm.consumers.add(stream, {
        durable_name: durable,
        ack_policy: AckPolicy.Explicit,
        filter_subject: CLICK_CREATED_SUBJECT,
        deliver_policy: 'all',
      });

      this.logger.debug(`Consumer for ${stream} created, durable: ${durable}`);

      return consumerInfo;
    } catch {
      this.logger.log('JetStream Clicks consumer already exists');
    }
  }

  async onModuleDestroy() {
    this.running = false;
    await this.nc.drain();
  }
}

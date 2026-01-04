import type { NatsConnection } from '@nats-io/nats-core';
import { connect } from '@nats-io/transport-node';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NATS_CONNECTION_SERVICE } from './constants';

@Global()
@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: NATS_CONNECTION_SERVICE,
      useFactory: async (
        configService: ConfigService,
      ): Promise<NatsConnection> => {
        const logger = new Logger(NatsModule.name);

        const natsConnection = await connect({
          servers: configService.getOrThrow<string>('nats.server'),
          name: configService.getOrThrow<string>('appName'),
        });

        natsConnection.closed().then((err: unknown) => {
          if (err) {
            logger.error('NATS connection closed with error', err);
          } else {
            logger.log('NATS connection closed cleanly');
          }
        });

        return natsConnection;
      },
    },
  ],
  exports: [NATS_CONNECTION_SERVICE],
})
export class NatsModule {}

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [configService.get<string>('nats.server') as string],
      queue: 'clicks-queue',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000); // for health checks (not used now)
  console.log('Clicks microservice is running');
}
bootstrap();

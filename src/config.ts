/* eslint-disable import/order */
import * as dotenv from 'dotenv';

dotenv.config();

import * as process from 'node:process';
import { DataSourceOptions } from 'typeorm';
import { AppConfig } from './_common/types/app-config.type';

const databaseConnectionOptions: DataSourceOptions = {
  type: 'postgres',
  host: getEnv<string>('DB_HOST'),
  port: getEnv<number>('DB_PORT'),
  username: getEnv<string>('DB_LOGIN'),
  password: getEnv<string>('DB_PASSWORD'),
  database: getEnv<string>('DB_NAME'),
  logging: getEnv<boolean>('DB_ENABLE_LOGGING'),
  synchronize: false,
};

export default (): AppConfig => ({
  appName: getEnv<string>('APP_NAME', true),
  databaseConnectionOptions,
  nats: {
    server: getEnv<string>('NATS_SERVER', true),
    streamName: getEnv<string>('NATS_STREAM_NAME', true),
  },
});

function getEnv<T extends string | number | boolean>(
  envName: string,
  strict = true,
): T {
  const raw = process.env[envName];
  if (raw === undefined) {
    if (strict) {
      throw new Error(`Environment ${envName} is undefined.`);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return;
  }

  if (typeof ('' as T) === 'number') {
    return Number(raw) as T;
  }

  if (typeof ('' as T) === 'boolean') {
    return (raw === 'true') as T;
  }

  if (typeof ('' as T) === 'string') {
    return String(raw).trim() as T;
  }

  return raw as T;
}

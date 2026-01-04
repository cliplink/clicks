import { DataSourceOptions } from 'typeorm';

export type AppConfig = {
  appName: string;
  databaseConnectionOptions: DataSourceOptions;
  nats: {
    server: string;
  };
};

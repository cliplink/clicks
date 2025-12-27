import { DataSourceOptions } from 'typeorm';

export type AppConfig = {
  databaseConnectionOptions: DataSourceOptions;
  nats: {
    server: string;
  };
};

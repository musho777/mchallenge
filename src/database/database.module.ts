import { Module } from '@nestjs/common';
import { Client } from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: async () => {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'test',
      password: 'm585828',
      port: 5434,
    });
    await client.connect();
    return client;
  },
};

@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule { }

import { Module } from '@nestjs/common';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: () => {
        return new Pool({
          host: 'localhost',
          port: 5434,
          user: 'postgres',
          password: 'm585828',
          database: 'test',
        });
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule { }

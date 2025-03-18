import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseProviders } from './database.providers';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => databaseProviders(),
    }),
  ],
})
export class DatabaseModule {}

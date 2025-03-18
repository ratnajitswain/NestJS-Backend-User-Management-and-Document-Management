import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = (): TypeOrmModuleOptions => {
  const configService = new ConfigService();
  
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('DB_SYNC', false),
  };
};

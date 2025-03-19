import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { Ingestion } from './ingestion.entity';
import { Document } from '../document/document.entity';
import { IngestionGateway } from './ingestion.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Ingestion, Document]), HttpModule],
  providers: [IngestionService, IngestionGateway],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { Document } from '../document/document.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IngestionGateway } from './ingestion.gateway';

@Injectable()
export class IngestionService {
  constructor(
    private httpService: HttpService,
    private ingestionGateway: IngestionGateway,
    @InjectRepository(Ingestion)
    private ingestionRepository: Repository<Ingestion>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async triggerIngestion(documentId: number) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) throw new Error('Document not found');

    const ingestion = this.ingestionRepository.create({
      document,
      status: IngestionStatus.IN_PROGRESS,
    });
    const savedIngestion = await this.ingestionRepository.save(ingestion);

    const webhookUrl = process.env.INGESTION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await lastValueFrom(
          this.httpService.post(webhookUrl, {
            ingestionId: savedIngestion.id,
            documentId,
          }),
        );
      } catch (error) {
        console.error('Webhook call failed:', error.message);
      }
    }

    // Emit WebSocket event
    this.ingestionGateway.sendUpdate(
      savedIngestion.id,
      IngestionStatus.IN_PROGRESS,
    );

    return savedIngestion;
  }

  async updateIngestionStatus(id: number, status: IngestionStatus) {
    await this.ingestionRepository.update(id, { status });
    const updatedIngestion = await this.ingestionRepository.findOne({
      where: { id },
    });

    // Emit WebSocket event
    this.ingestionGateway.sendUpdate(id, status);

    return updatedIngestion;
  }

  async getAllIngestions() {
    return this.ingestionRepository.find({ relations: ['document'] });
  }
}

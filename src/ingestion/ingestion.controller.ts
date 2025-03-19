import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionStatus } from './ingestion.entity';

@Controller('ingestion')
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post('trigger/:documentId')
  async triggerIngestion(@Param('documentId') documentId: number) {
    return this.ingestionService.triggerIngestion(documentId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: number, @Body('status') status: IngestionStatus) {
    return this.ingestionService.updateIngestionStatus(id, status);
  }

  @Get()
  async getAllIngestions() {
    return this.ingestionService.getAllIngestions();
  }
}

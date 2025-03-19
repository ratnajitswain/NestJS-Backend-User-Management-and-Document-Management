import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IngestionStatus } from './ingestion.entity';

const mockIngestionService = {
  triggerIngestion: jest.fn().mockResolvedValue({ id: 1, status: IngestionStatus.IN_PROGRESS }),
  updateIngestionStatus: jest.fn().mockResolvedValue({ id: 1, status: IngestionStatus.COMPLETED }),
  getAllIngestions: jest.fn().mockResolvedValue([{ id: 1, status: IngestionStatus.PENDING }]),
};

describe('IngestionController', () => {
  let controller: IngestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [{ provide: IngestionService, useValue: mockIngestionService }],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
  });

  it('should trigger ingestion', async () => {
    const result = await controller.triggerIngestion(1);
    expect(result).toEqual({ id: 1, status: IngestionStatus.IN_PROGRESS });
    expect(mockIngestionService.triggerIngestion).toHaveBeenCalledWith(1);
  });

  it('should update ingestion status', async () => {
    const result = await controller.updateStatus(1, IngestionStatus.COMPLETED);
    expect(result).toEqual({ id: 1, status: IngestionStatus.COMPLETED });
    expect(mockIngestionService.updateIngestionStatus).toHaveBeenCalledWith(1, IngestionStatus.COMPLETED);
  });

  it('should get all ingestions', async () => {
    const result = await controller.getAllIngestions();
    expect(result).toEqual([{ id: 1, status: IngestionStatus.PENDING }]);
    expect(mockIngestionService.getAllIngestions).toHaveBeenCalled();
  });
});

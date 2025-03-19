import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { Document } from '../document/document.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { IngestionGateway } from './ingestion.gateway';

const mockIngestionRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest
    .fn()
    .mockImplementation((ingestion) =>
      Promise.resolve({ ...ingestion, id: 1 }),
    ),
  update: jest.fn(),
  findOne: jest
    .fn()
    .mockResolvedValue({ id: 1, status: IngestionStatus.PENDING }),
  find: jest
    .fn()
    .mockResolvedValue([{ id: 1, status: IngestionStatus.PENDING }]),
};

const mockDocumentRepository = {
  findOne: jest.fn().mockResolvedValue({ id: 1 }),
};

const mockHttpService = {
  post: jest.fn().mockImplementation(() => of({ data: {} })),
};

const mockIngestionGateway = {
  sendUpdate: jest.fn(),
};

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionRepository: Repository<Ingestion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Ingestion),
          useValue: mockIngestionRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        { provide: HttpService, useValue: mockHttpService },
        { provide: IngestionGateway, useValue: mockIngestionGateway },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionRepository = module.get<Repository<Ingestion>>(
      getRepositoryToken(Ingestion),
    );

    // Mock the environment variable
    process.env.INGESTION_WEBHOOK_URL = 'http://example.com/webhook';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.INGESTION_WEBHOOK_URL;
  });

  it('should trigger ingestion successfully', async () => {
    const result = await service.triggerIngestion(1);
    expect(result).toEqual({
      document: { id: 1 },
      status: IngestionStatus.IN_PROGRESS,
      id: 1,
    });
    expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockIngestionRepository.create).toHaveBeenCalledWith({
      document: { id: 1 },
      status: IngestionStatus.IN_PROGRESS,
    });
    expect(mockIngestionRepository.save).toHaveBeenCalled();
    expect(mockHttpService.post).toHaveBeenCalledWith(
      'http://example.com/webhook',
      {
        ingestionId: 1,
        documentId: 1,
      },
    );
    expect(mockIngestionGateway.sendUpdate).toHaveBeenCalledWith(
      1,
      IngestionStatus.IN_PROGRESS,
    );
  });

  it('should throw an error if document is not found', async () => {
    mockDocumentRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.triggerIngestion(1)).rejects.toThrow(
      'Document not found',
    );
  });

  it('should handle webhook call failure', async () => {
    mockHttpService.post.mockImplementationOnce(() =>
      throwError(new Error('Webhook failed')),
    );
    const result = await service.triggerIngestion(1);
    expect(result).toEqual({
      document: { id: 1 },
      status: IngestionStatus.IN_PROGRESS,
      id: 1,
    });
    expect(mockHttpService.post).toHaveBeenCalled();
    expect(mockIngestionGateway.sendUpdate).toHaveBeenCalledWith(
      1,
      IngestionStatus.IN_PROGRESS,
    );
  });

  it('should update ingestion status', async () => {
    const result = await service.updateIngestionStatus(
      1,
      IngestionStatus.COMPLETED,
    );
    expect(result).toEqual({ id: 1, status: IngestionStatus.PENDING });
    expect(mockIngestionRepository.update).toHaveBeenCalledWith(1, {
      status: IngestionStatus.COMPLETED,
    });
    expect(mockIngestionGateway.sendUpdate).toHaveBeenCalledWith(
      1,
      IngestionStatus.COMPLETED,
    );
  });

  it('should get all ingestions', async () => {
    const result = await service.getAllIngestions();
    expect(result).toEqual([{ id: 1, status: IngestionStatus.PENDING }]);
    expect(mockIngestionRepository.find).toHaveBeenCalledWith({
      relations: ['document'],
    });
  });
});

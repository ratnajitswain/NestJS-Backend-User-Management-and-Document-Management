import { Test, TestingModule } from '@nestjs/testing';
import { IngestionGateway } from './ingestion.gateway';
import { Server } from 'socket.io';

describe('IngestionGateway', () => {
  let gateway: IngestionGateway;
  let mockServer: { emit: jest.Mock };

  beforeEach(async () => {
    mockServer = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestionGateway],
    }).compile();

    gateway = module.get<IngestionGateway>(IngestionGateway);
    gateway.server = mockServer as unknown as Server;
  });

  it('should send ingestion update', () => {
    gateway.sendUpdate(1, 'completed');
    expect(mockServer.emit).toHaveBeenCalledWith('ingestionUpdate', { ingestionId: 1, status: 'completed' });
  });
});

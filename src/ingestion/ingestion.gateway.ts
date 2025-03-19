import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class IngestionGateway {
  @WebSocketServer()
  server: Server;

  sendUpdate(ingestionId: number, status: string) {
    this.server.emit('ingestionUpdate', { ingestionId, status });
  }
}

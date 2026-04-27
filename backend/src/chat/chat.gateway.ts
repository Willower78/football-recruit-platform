import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify<AuthPayload>(token);
      (client as Socket & { userId?: string }).userId = payload.sub;

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as Socket & { userId?: string }).userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket & { userId?: string },
    @MessageBody() body: { recipientId: string; content: string },
  ) {
    if (!client.userId || !body.recipientId || !body.content?.trim()) return;

    const msg = await this.chatService.sendMessage(
      client.userId,
      body.recipientId,
      body.content.trim(),
    );

    const payload = {
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      createdAt: msg.createdAt,
    };

    // Deliver to sender
    client.emit('new_message', payload);

    // Deliver to recipient (skip sender's socket to avoid duplicates)
    const recipientSockets = this.userSockets.get(body.recipientId);
    if (recipientSockets) {
      for (const socketId of recipientSockets) {
        if (socketId !== client.id) {
          this.server.to(socketId).emit('new_message', payload);
        }
      }
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket & { userId?: string },
    @MessageBody() body: { senderId: string },
  ) {
    if (!client.userId || !body.senderId) return;
    await this.chatService.markRead(client.userId, body.senderId);
  }
}

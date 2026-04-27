import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Message) private readonly msgRepo: Repository<Message>) {}

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    const msg = this.msgRepo.create({ senderId, recipientId, content });
    return this.msgRepo.save(msg);
  }

  async getConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
    const [items, total] = await this.msgRepo.findAndCount({
      where: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: items.reverse(), total, page, limit };
  }

  async getConversations(userId: string) {
    const result = await this.msgRepo
      .createQueryBuilder('m')
      .select('CASE WHEN m.sender_id = :uid THEN m.recipient_id ELSE m.sender_id END', 'userId')
      .addSelect('MAX(m.created_at)', 'lastMessageAt')
      .addSelect('COUNT(CASE WHEN m.read = false AND m.recipient_id = :uid THEN 1 END)', 'unread')
      .where('m.sender_id = :uid OR m.recipient_id = :uid', { uid: userId })
      .groupBy('CASE WHEN m.sender_id = :uid THEN m.recipient_id ELSE m.sender_id END')
      .orderBy('"lastMessageAt"', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      userId: r.userId,
      lastMessageAt: r.lastMessageAt,
      unread: Number(r.unread),
    }));
  }

  async markRead(userId: string, senderId: string): Promise<void> {
    await this.msgRepo.update({ recipientId: userId, senderId, read: false }, { read: true });
  }
}

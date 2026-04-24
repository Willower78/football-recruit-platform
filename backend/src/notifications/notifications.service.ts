import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata: Record<string, unknown> = {},
  ): Promise<Notification> {
    const notification = this.repo.create({ userId, type, title, message, metadata });
    return this.repo.save(notification);
  }

  async list(userId: string, filters: { read?: string; page?: number; limit?: number }) {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC');

    if (filters.read !== undefined) {
      qb.andWhere('n.read = :read', { read: filters.read === 'true' });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = true;
    return this.repo.save(notification);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId, read: false }, { read: true });
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }
}

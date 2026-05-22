import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async findByRecipient(
    recipientId: string,
    recipientType: string,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientId, recipientType },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(
    recipientId: string,
    recipientType: string,
  ): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId, recipientType, isRead: false },
    });
  }

  async sendNotification(
    recipientId: string,
    recipientType: string,
    type: string,
    title: string,
    content: string,
  ): Promise<Notification> {
    return this.create({
      recipientId,
      recipientType,
      type,
      title,
      content,
    });
  }
}

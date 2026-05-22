import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(id);
  }

  @Post()
  async create(@Body() notificationData: Partial<Notification>): Promise<Notification> {
    return this.notificationService.create(notificationData);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationService.remove(id);
  }

  @Get('recipient/:recipientType/:recipientId')
  async findByRecipient(
    @Param('recipientType') recipientType: string,
    @Param('recipientId') recipientId: string,
  ): Promise<Notification[]> {
    return this.notificationService.findByRecipient(recipientId, recipientType);
  }

  @Get('recipient/:recipientType/:recipientId/unread-count')
  async getUnreadCount(
    @Param('recipientType') recipientType: string,
    @Param('recipientId') recipientId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(
      recipientId,
      recipientType,
    );
    return { count };
  }
}

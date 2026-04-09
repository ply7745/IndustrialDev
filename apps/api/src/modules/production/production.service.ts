import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder } from './production.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly orderRepository: Repository<ProductionOrder>,
  ) {}

  findAll(): Promise<ProductionOrder[]> {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<ProductionOrder> {
    return this.orderRepository.findOne({ where: { id } });
  }

  create(order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const newOrder = this.orderRepository.create({
      ...order,
      orderNo: `PO-${Date.now()}`,
      status: 'pending',
    });
    return this.orderRepository.save(newOrder);
  }

  async update(id: string, order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Order not found');
    Object.assign(existing, order);
    return this.orderRepository.save(existing);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async startProduction(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');
    order.status = 'in_progress';
    order.startTime = new Date();
    return this.orderRepository.save(order);
  }

  async completeProduction(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');
    order.status = 'completed';
    order.endTime = new Date();
    return this.orderRepository.save(order);
  }
}
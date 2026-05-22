import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReplenishmentOrder } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class ReplenishmentOrderService {
  constructor(
    @InjectRepository(ReplenishmentOrder)
    private replenishmentOrderRepository: Repository<ReplenishmentOrder>,
  ) {}

  async create(dto: any): Promise<ReplenishmentOrder> {
    const order = this.replenishmentOrderRepository.create({
      ...dto,
      orderNo: dto.orderNo || `REP-${Date.now()}`,
      status: 'PENDING',
    });
    return this.replenishmentOrderRepository.save(order);
  }

  async findAll(query: any): Promise<{ list: ReplenishmentOrder[]; total: number }> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.replenishmentOrderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<ReplenishmentOrder> {
    const order = await this.replenishmentOrderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`补投单 ${id} 不存在`);
    }

    return order;
  }

  async update(id: string, dto: any): Promise<ReplenishmentOrder> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.replenishmentOrderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.replenishmentOrderRepository.remove(order);
  }

  async approve(id: string): Promise<ReplenishmentOrder> {
    const order = await this.findOne(id);
    order.status = 'APPROVED';
    return this.replenishmentOrderRepository.save(order);
  }

  async batchImport(orders: any[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const dto of orders) {
      try {
        await this.create(dto);
        success++;
      } catch (error) {
        failed++;
        errors.push(`${dto.orderNo || 'unknown'}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { SalesOrder, OrderSplit, OrderChange } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private orderRepository: Repository<SalesOrder>,
    @InjectRepository(OrderSplit)
    private orderSplitRepository: Repository<OrderSplit>,
    @InjectRepository(OrderChange)
    private orderChangeRepository: Repository<OrderChange>,
  ) {}

  async create(dto: any): Promise<SalesOrder> {
    const order = this.orderRepository.create({
      ...dto,
      orderNo: dto.orderNo || `SO${Date.now()}`,
      status: 'PENDING',
      approvalStatus: 'PENDING',
    });
    return this.orderRepository.save(order);
  }

  async findAll(query: any): Promise<{ list: SalesOrder[]; total: number }> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.approvalStatus) {
      where.approvalStatus = query.approvalStatus;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.orderType) {
      where.orderType = query.orderType;
    }
    if (query.startDate && query.endDate) {
      where.orderDate = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['customer'],
      order: { priority: 'ASC', demandDate: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<SalesOrder> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'splits', 'changes'],
    });

    if (!order) {
      throw new NotFoundException(`订单 ${id} 不存在`);
    }

    return order;
  }

  async update(id: string, dto: any): Promise<SalesOrder> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async approve(id: string): Promise<SalesOrder> {
    const order = await this.findOne(id);
    order.approvalStatus = 'APPROVED';
    order.status = 'APPROVED';
    return this.orderRepository.save(order);
  }

  async reject(id: string, reason?: string): Promise<SalesOrder> {
    const order = await this.findOne(id);
    order.approvalStatus = 'REJECTED';
    order.status = 'REJECTED';
    return this.orderRepository.save(order);
  }

  async split(id: string, dto: { splitQuantity: number; splitReason?: string; demandDate?: Date }): Promise<OrderSplit> {
    const order = await this.findOne(id);

    if (dto.splitQuantity >= order.quantity) {
      throw new BadRequestException('拆分数量不能大于等于订单数量');
    }

    const split = this.orderSplitRepository.create({
      originalOrderId: id,
      splitOrderNo: `SPL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      splitQuantity: dto.splitQuantity,
      splitReason: dto.splitReason,
      demandDate: dto.demandDate || order.demandDate,
      priority: order.priority,
    });

    return this.orderSplitRepository.save(split);
  }

  async change(id: string, dto: { changeType: string; originalValue?: string; newValue?: string; changeReason?: string }): Promise<OrderChange> {
    const order = await this.findOne(id);

    const change = this.orderChangeRepository.create({
      orderId: id,
      changeType: dto.changeType,
      originalValue: dto.originalValue,
      newValue: dto.newValue,
      changeReason: dto.changeReason,
      status: 'APPROVED',
    });

    await this.orderChangeRepository.save(change);

    const updateData: any = {};
    switch (dto.changeType) {
      case 'QUANTITY':
        updateData.quantity = parseFloat(dto.newValue);
        break;
      case 'DATE':
        updateData.demandDate = new Date(dto.newValue);
        break;
      case 'PRIORITY':
        updateData.priority = parseInt(dto.newValue);
        break;
    }
    Object.assign(order, updateData);
    await this.orderRepository.save(order);

    return change;
  }

  async getPendingReviewOrders(): Promise<SalesOrder[]> {
    return this.orderRepository.find({
      where: { approvalStatus: 'PENDING' },
      relations: ['customer'],
      order: { orderDate: 'DESC' },
    });
  }

  async getApprovedOrders(startDate?: Date, endDate?: Date): Promise<SalesOrder[]> {
    const where: any = {
      approvalStatus: 'APPROVED',
      status: In(['APPROVED', 'IN_PROGRESS']),
    };

    if (startDate && endDate) {
      where.demandDate = Between(startDate, endDate);
    }

    return this.orderRepository.find({
      where,
      relations: ['customer'],
      order: { priority: 'ASC', demandDate: 'ASC' },
    });
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

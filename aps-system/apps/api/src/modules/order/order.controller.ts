import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SalesOrder,
  OrderSplit,
  OrderChange,
  ReplenishmentOrder,
} from '../../../../packages/database/src/entities/aps.entities';

class CreateOrderDto {
  orderNo: string;
  customerId: string;
  materialId: string;
  orderType: string;
  quantity: number;
  orderDate: Date;
  demandDate: Date;
  unitPrice?: number;
  priority?: number;
}

class UpdateOrderDto {
  quantity?: number;
  demandDate?: Date;
  unitPrice?: number;
  priority?: number;
  status?: string;
}

class SplitOrderDto {
  splitQuantity: number;
  splitReason?: string;
  demandDate?: Date;
}

class ChangeOrderDto {
  changeType: string;
  originalValue?: string;
  newValue?: string;
  changeReason?: string;
}

@ApiTags('订单管理')
@ApiBearerAuth()
@Controller('api/v1/orders')
export class OrderController {
  constructor(
    @InjectRepository(SalesOrder)
    private orderRepository: Repository<SalesOrder>,
    @InjectRepository(OrderSplit)
    private orderSplitRepository: Repository<OrderSplit>,
    @InjectRepository(OrderChange)
    private orderChangeRepository: Repository<OrderChange>,
    @InjectRepository(ReplenishmentOrder)
    private replenishmentOrderRepository: Repository<ReplenishmentOrder>,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Body() dto: CreateOrderDto): Promise<SalesOrder> {
    const order = this.orderRepository.create({
      ...dto,
      orderNo: dto.orderNo || `ORD-${Date.now()}`,
      status: 'PENDING',
      approvalStatus: 'PENDING',
    });
    return this.orderRepository.save(order);
  }

  @Get()
  @ApiOperation({ summary: '查询订单列表' })
  async findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SalesOrder[]> {
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.splits', 'splits');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }
    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate });
    }

    return queryBuilder.orderBy('order.priority', 'ASC').addOrderBy('order.demandDate', 'ASC').getMany();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Param('id') id: string): Promise<SalesOrder> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'splits', 'changes', 'insertions'],
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新订单' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<SalesOrder> {
    await this.orderRepository.update(id, dto);
    return this.orderRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }

  @Post(':id/split')
  @ApiOperation({ summary: '订单拆分' })
  async split(
    @Param('id') id: string,
    @Body() dto: SplitOrderDto,
  ): Promise<OrderSplit> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new Error('Order not found');
    }

    const splitNo = `SPL-${Date.now()}`;
    const split = this.orderSplitRepository.create({
      originalOrderId: id,
      splitOrderNo: splitNo,
      splitQuantity: dto.splitQuantity,
      splitReason: dto.splitReason,
      demandDate: dto.demandDate,
      priority: order.priority,
    });

    return this.orderSplitRepository.save(split);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '订单评审' })
  async approve(@Param('id') id: string): Promise<SalesOrder> {
    await this.orderRepository.update(id, {
      approvalStatus: 'APPROVED',
      status: 'APPROVED',
    });
    return this.orderRepository.findOne({ where: { id } });
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '订单评审拒绝' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<SalesOrder> {
    await this.orderRepository.update(id, {
      approvalStatus: 'REJECTED',
      status: 'REJECTED',
    });
    return this.orderRepository.findOne({ where: { id } });
  }

  @Post(':id/change')
  @ApiOperation({ summary: '订单变更' })
  async change(
    @Param('id') id: string,
    @Body() dto: ChangeOrderDto,
  ): Promise<OrderChange> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new Error('Order not found');
    }

    const change = this.orderChangeRepository.create({
      orderId: id,
      changeType: dto.changeType,
      originalValue: dto.originalValue,
      newValue: dto.newValue,
      changeReason: dto.changeReason,
      status: 'APPLIED',
    });

    await this.orderChangeRepository.save(change);

    if (dto.newValue) {
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
      await this.orderRepository.update(id, updateData);
    }

    return change;
  }

  @Get('pending-review/list')
  @ApiOperation({ summary: '待评审订单列表' })
  async getPendingReview(): Promise<SalesOrder[]> {
    return this.orderRepository.find({
      where: { approvalStatus: 'PENDING' },
      relations: ['customer'],
      order: { orderDate: 'DESC' },
    });
  }
}

@ApiTags('补投单管理')
@ApiBearerAuth()
@Controller('api/v1/replenishment-orders')
export class ReplenishmentOrderController {
  constructor(
    @InjectRepository(ReplenishmentOrder)
    private replenishmentOrderRepository: Repository<ReplenishmentOrder>,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建补投单' })
  async create(@Body() dto: any): Promise<ReplenishmentOrder> {
    const order = this.replenishmentOrderRepository.create({
      ...dto,
      orderNo: dto.orderNo || `REP-${Date.now()}`,
      status: 'PENDING',
    });
    return this.replenishmentOrderRepository.save(order);
  }

  @Get()
  @ApiOperation({ summary: '查询补投单列表' })
  async findAll(
    @Query('status') status?: string,
  ): Promise<ReplenishmentOrder[]> {
    const where: any = {};
    if (status) where.status = status;

    return this.replenishmentOrderRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取补投单详情' })
  async findOne(@Param('id') id: string): Promise<ReplenishmentOrder> {
    return this.replenishmentOrderRepository.findOne({ where: { id } });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新补投单' })
  async update(
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<ReplenishmentOrder> {
    await this.replenishmentOrderRepository.update(id, dto);
    return this.replenishmentOrderRepository.findOne({ where: { id } });
  }
}

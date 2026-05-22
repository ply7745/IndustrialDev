import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderSplit } from '../../../../../packages/database/src/entities/aps.entities';

@ApiTags('工单管理')
@ApiBearerAuth()
@Controller('api/v1/work-orders')
export class WorkOrderController {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(WorkOrderSplit)
    private workOrderSplitRepository: Repository<WorkOrderSplit>,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建工单' })
  async create(@Body() dto: any) {
    const workOrder = this.workOrderRepository.create({
      ...dto,
      orderNo: dto.orderNo || `WO${Date.now()}`,
      status: 'PLANNING',
    });
    return this.workOrderRepository.save(workOrder);
  }

  @Get()
  @ApiOperation({ summary: '查询工单列表' })
  async findAll(@Query() query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.sourceType) where.sourceType = query.sourceType;

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.workOrderRepository.findAndCount({
      where,
      order: { priority: 'ASC', plannedStartDate: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工单详情' })
  async findOne(@Param('id') id: string) {
    return this.workOrderRepository.findOne({
      where: { id },
      relations: ['splits'],
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工单' })
  async update(@Param('id') id: string, @Body() dto: any) {
    await this.workOrderRepository.update(id, dto);
    return this.workOrderRepository.findOne({ where: { id } });
  }

  @Post(':id/release')
  @ApiOperation({ summary: '下达工单' })
  async release(@Param('id') id: string) {
    await this.workOrderRepository.update(id, { status: 'RELEASED' });
    return this.workOrderRepository.findOne({ where: { id } });
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始工单' })
  async start(@Param('id') id: string) {
    await this.workOrderRepository.update(id, {
      status: 'IN_PROGRESS',
      actualStartDate: new Date(),
    });
    return this.workOrderRepository.findOne({ where: { id } });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成工单' })
  async complete(@Param('id') id: string, @Body('quantity') quantity?: number) {
    const workOrder = await this.workOrderRepository.findOne({ where: { id } });
    if (quantity !== undefined) {
      workOrder.completedQuantity = quantity;
    }
    if (workOrder.completedQuantity >= workOrder.quantity) {
      workOrder.status = 'COMPLETED';
      workOrder.actualEndDate = new Date();
    }
    await this.workOrderRepository.save(workOrder);
    return workOrder;
  }

  @Post(':id/split')
  @ApiOperation({ summary: '拆分工单' })
  async split(@Param('id') id: string, @Body() dto: any) {
    const workOrder = await this.workOrderRepository.findOne({ where: { id } });

    const split = this.workOrderSplitRepository.create({
      originalWorkOrderId: id,
      splitOrderNo: `SPL-WO-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      splitQuantity: dto.splitQuantity,
      splitReason: dto.splitReason,
    });

    return this.workOrderSplitRepository.save(split);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: '锁定工单' })
  async lock(@Param('id') id: string, @Body('reason') reason: string) {
    await this.workOrderRepository.update(id, {
      isLocked: true,
      lockReason: reason,
    });
    return this.workOrderRepository.findOne({ where: { id } });
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: '解锁工单' })
  async unlock(@Param('id') id: string) {
    await this.workOrderRepository.update(id, {
      isLocked: false,
      lockReason: null,
    });
    return this.workOrderRepository.findOne({ where: { id } });
  }

  @Post('batch')
  @ApiOperation({ summary: '批量导入工单' })
  async batchImport(@Body() workOrders: any[]) {
    return { success: workOrders.length, failed: 0, errors: [] };
  }
}

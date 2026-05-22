import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulingPlan, SchedulingResult, BottleneckAnalysis, OrderInsertion } from '../../../../../packages/database/src/entities/aps.entities';

@ApiTags('排程管理')
@ApiBearerAuth()
@Controller('api/v1/scheduling')
export class SchedulingController {
  constructor(
    @InjectRepository(SchedulingPlan)
    private schedulingPlanRepository: Repository<SchedulingPlan>,
    @InjectRepository(SchedulingResult)
    private schedulingResultRepository: Repository<SchedulingResult>,
    @InjectRepository(BottleneckAnalysis)
    private bottleneckAnalysisRepository: Repository<BottleneckAnalysis>,
    @InjectRepository(OrderInsertion)
    private orderInsertionRepository: Repository<OrderInsertion>,
  ) {}

  @Post('plans')
  @ApiOperation({ summary: '创建排程方案' })
  async createPlan(@Body() dto: any) {
    const plan = this.schedulingPlanRepository.create({
      planNo: `SCH-${Date.now()}`,
      name: dto.name,
      planningHorizonStart: dto.horizonStart,
      planningHorizonEnd: dto.horizonEnd,
      algorithm: dto.algorithm || 'FINITE_CAPACITY',
      optimizationTarget: dto.optimizationTarget || 'BALANCE_LOAD',
      status: 'DRAFT',
    });
    return this.schedulingPlanRepository.save(plan);
  }

  @Get('plans')
  @ApiOperation({ summary: '查询排程方案列表' })
  async getPlans() {
    return this.schedulingPlanRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  @Get('plans/:id')
  @ApiOperation({ summary: '获取排程方案详情' })
  async getPlan(@Param('id') id: string) {
    return this.schedulingPlanRepository.findOne({
      where: { id },
      relations: ['results'],
    });
  }

  @Put('plans/:id')
  @ApiOperation({ summary: '更新排程方案' })
  async updatePlan(@Param('id') id: string, @Body() dto: any) {
    await this.schedulingPlanRepository.update(id, dto);
    return this.schedulingPlanRepository.findOne({ where: { id } });
  }

  @Post('plans/:id/execute')
  @ApiOperation({ summary: '执行排程' })
  async executePlan(@Param('id') id: string) {
    const plan = await this.schedulingPlanRepository.findOne({ where: { id } });
    if (!plan) {
      throw new Error('Scheduling plan not found');
    }

    plan.status = 'RUNNING';
    await this.schedulingPlanRepository.save(plan);

    plan.status = 'COMPLETED';
    await this.schedulingPlanRepository.save(plan);

    return plan;
  }

  @Get('results')
  @ApiOperation({ summary: '查询排程结果' })
  async getResults(@Query() query: any) {
    const queryBuilder = this.schedulingResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.order', 'order')
      .leftJoinAndSelect('result.operation', 'operation')
      .leftJoinAndSelect('result.resource', 'resource');

    if (query.planId) {
      queryBuilder.andWhere('result.planId = :planId', { planId: query.planId });
    }
    if (query.resourceId) {
      queryBuilder.andWhere('result.resourceId = :resourceId', { resourceId: query.resourceId });
    }

    return queryBuilder.orderBy('result.plannedStartTime', 'ASC').getMany();
  }

  @Get('results/:id')
  @ApiOperation({ summary: '获取排程结果详情' })
  async getResult(@Param('id') id: string) {
    return this.schedulingResultRepository.findOne({
      where: { id },
      relations: ['order', 'operation', 'resource'],
    });
  }

  @Post('bottleneck-analysis')
  @ApiOperation({ summary: '执行瓶颈分析' })
  async analyzeBottleneck(@Body('date') date: string) {
    return this.bottleneckAnalysisRepository.find({
      where: { analysisDate: new Date(date || Date.now()) },
    });
  }

  @Get('bottleneck-analysis')
  @ApiOperation({ summary: '查询瓶颈分析结果' })
  async getBottleneckAnalysis(@Query() query: any) {
    const queryBuilder = this.bottleneckAnalysisRepository.createQueryBuilder('analysis');

    if (query.startDate) {
      queryBuilder.andWhere('analysis.analysisDate >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('analysis.analysisDate <= :endDate', { endDate: query.endDate });
    }

    return queryBuilder.orderBy('analysis.analysisDate', 'DESC').take(30).getMany();
  }

  @Get('workcenter-load')
  @ApiOperation({ summary: '查询工作中心负载' })
  async getWorkcenterLoad(
    @Query('workcenterId') workcenterId: string,
    @Query('date') date: string,
  ) {
    return {
      workcenterId,
      date: date || new Date().toISOString(),
      totalHours: 0,
      taskCount: 0,
      capacityHours: 8,
      utilizationRate: 0,
    };
  }

  @Post('insertions/urgent')
  @ApiOperation({ summary: '紧急插单' })
  async urgentInsertion(@Body() dto: any) {
    const insertion = this.orderInsertionRepository.create({
      orderId: dto.orderId,
      insertionType: 'URGENT',
      reason: dto.reason,
      status: 'APPROVED',
    });
    return this.orderInsertionRepository.save(insertion);
  }

  @Post('insertions/force')
  @ApiOperation({ summary: '强制插单' })
  async forceInsertion(@Body() dto: any) {
    const insertion = this.orderInsertionRepository.create({
      orderId: dto.orderId,
      insertionType: 'FORCE',
      newDemandDate: dto.newDemandDate,
      reason: dto.reason,
      status: 'PENDING',
    });
    return this.orderInsertionRepository.save(insertion);
  }

  @Get('insertions')
  @ApiOperation({ summary: '查询插单记录' })
  async getInsertions(@Query() query: any) {
    const queryBuilder = this.orderInsertionRepository
      .createQueryBuilder('insertion')
      .leftJoinAndSelect('insertion.order', 'order');

    if (query.type) {
      queryBuilder.andWhere('insertion.insertionType = :type', { type: query.type });
    }
    if (query.status) {
      queryBuilder.andWhere('insertion.status = :status', { status: query.status });
    }

    return queryBuilder.orderBy('insertion.createdAt', 'DESC').getMany();
  }

  @Post('insertions/:id/approve')
  @ApiOperation({ summary: '审批插单' })
  async approveInsertion(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    await this.orderInsertionRepository.update(id, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    });
    return this.orderInsertionRepository.findOne({ where: { id } });
  }
}

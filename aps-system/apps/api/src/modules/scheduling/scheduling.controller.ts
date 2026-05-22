import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SchedulingPlan,
  SchedulingResult,
  BottleneckAnalysis,
  OrderInsertion,
} from '../../../../packages/database/src/entities/aps.entities';

class CreateSchedulingPlanDto {
  name: string;
  horizonStart: Date;
  horizonEnd: Date;
  algorithm?: string;
  optimizationTarget?: string;
}

class UrgentInsertionDto {
  orderId: string;
  reason: string;
}

class ForceInsertionDto {
  orderId: string;
  newDemandDate: Date;
  reason: string;
}

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
  async createPlan(
    @Body() dto: CreateSchedulingPlanDto,
  ): Promise<SchedulingPlan> {
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
  async getPlans(): Promise<SchedulingPlan[]> {
    return this.schedulingPlanRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  @Get('plans/:id')
  @ApiOperation({ summary: '获取排程方案详情' })
  async getPlan(@Param('id') id: string): Promise<SchedulingPlan> {
    return this.schedulingPlanRepository.findOne({
      where: { id },
      relations: ['results'],
    });
  }

  @Put('plans/:id')
  @ApiOperation({ summary: '更新排程方案' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: Partial<SchedulingPlan>,
  ): Promise<SchedulingPlan> {
    await this.schedulingPlanRepository.update(id, dto);
    return this.schedulingPlanRepository.findOne({ where: { id } });
  }

  @Post('plans/:id/execute')
  @ApiOperation({ summary: '执行排程' })
  async executePlan(@Param('id') id: string): Promise<SchedulingPlan> {
    const plan = await this.schedulingPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new Error('Scheduling plan not found');
    }

    plan.status = 'RUNNING';
    await this.schedulingPlanRepository.save(plan);

    const results = await this.performScheduling(plan);

    plan.status = 'COMPLETED';
    await this.schedulingPlanRepository.save(plan);

    return plan;
  }

  private async performScheduling(plan: SchedulingPlan): Promise<SchedulingResult[]> {
    const results: SchedulingResult[] = [];

    return results;
  }

  @Get('results')
  @ApiOperation({ summary: '查询排程结果' })
  async getResults(
    @Query('planId') planId?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SchedulingResult[]> {
    const queryBuilder = this.schedulingResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.order', 'order')
      .leftJoinAndSelect('result.operation', 'operation')
      .leftJoinAndSelect('result.resource', 'resource');

    if (planId) {
      queryBuilder.andWhere('result.planId = :planId', { planId });
    }
    if (resourceId) {
      queryBuilder.andWhere('result.resourceId = :resourceId', { resourceId });
    }
    if (startDate) {
      queryBuilder.andWhere('result.plannedStartTime >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('result.plannedEndTime <= :endDate', { endDate });
    }

    return queryBuilder
      .orderBy('result.plannedStartTime', 'ASC')
      .getMany();
  }

  @Get('results/:id')
  @ApiOperation({ summary: '获取排程结果详情' })
  async getResult(@Param('id') id: string): Promise<SchedulingResult> {
    return this.schedulingResultRepository.findOne({
      where: { id },
      relations: ['order', 'operation', 'resource'],
    });
  }
}

@ApiTags('瓶颈分析')
@ApiBearerAuth()
@Controller('api/v1/scheduling/bottleneck-analysis')
export class BottleneckAnalysisController {
  constructor(
    @InjectRepository(BottleneckAnalysis)
    private bottleneckAnalysisRepository: Repository<BottleneckAnalysis>,
    @InjectRepository(SchedulingResult)
    private schedulingResultRepository: Repository<SchedulingResult>,
  ) {}

  @Post()
  @ApiOperation({ summary: '执行瓶颈分析' })
  async analyze(@Body('date') date: string): Promise<BottleneckAnalysis[]> {
    const analysisDate = new Date(date || Date.now());

    return this.bottleneckAnalysisRepository.find({
      where: { analysisDate },
    });
  }

  @Get()
  @ApiOperation({ summary: '查询瓶颈分析结果' })
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BottleneckAnalysis[]> {
    const queryBuilder = this.bottleneckAnalysisRepository
      .createQueryBuilder('analysis');

    if (startDate) {
      queryBuilder.andWhere('analysis.analysisDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('analysis.analysisDate <= :endDate', {
        endDate,
      });
    }

    return queryBuilder
      .orderBy('analysis.analysisDate', 'DESC')
      .take(30)
      .getMany();
  }

  @Get('workcenter-load')
  @ApiOperation({ summary: '查询工作中心负载' })
  async getWorkcenterLoad(
    @Query('workcenterId') workcenterId: string,
    @Query('date') date: string,
  ): Promise<any> {
    const targetDate = new Date(date || Date.now());
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const results = await this.schedulingResultRepository
      .createQueryBuilder('result')
      .select('result.resourceId', 'resourceId')
      .addSelect('SUM(EXTRACT(EPOCH FROM (result.plannedEndTime - result.plannedStartTime)) / 3600)', 'totalHours')
      .addSelect('COUNT(*)', 'taskCount')
      .where('result.resourceId = :workcenterId', { workcenterId })
      .andWhere('result.plannedStartTime >= :startOfDay', { startOfDay })
      .andWhere('result.plannedStartTime <= :endOfDay', { endOfDay })
      .groupBy('result.resourceId')
      .getRawOne();

    return {
      workcenterId,
      date: targetDate,
      totalHours: results?.totalHours || 0,
      taskCount: results?.taskCount || 0,
      capacityHours: 8,
      utilizationRate: results?.totalHours
        ? (results.totalHours / 8) * 100
        : 0,
    };
  }
}

@ApiTags('插单管理')
@ApiBearerAuth()
@Controller('api/v1/scheduling/insertions')
export class OrderInsertionController {
  constructor(
    @InjectRepository(OrderInsertion)
    private orderInsertionRepository: Repository<OrderInsertion>,
    @InjectRepository(SchedulingResult)
    private schedulingResultRepository: Repository<SchedulingResult>,
  ) {}

  @Post('urgent')
  @ApiOperation({ summary: '紧急插单' })
  async urgentInsertion(
    @Body() dto: UrgentInsertionDto,
  ): Promise<OrderInsertion> {
    const insertion = this.orderInsertionRepository.create({
      orderId: dto.orderId,
      insertionType: 'URGENT',
      reason: dto.reason,
      status: 'APPROVED',
    });

    return this.orderInsertionRepository.save(insertion);
  }

  @Post('force')
  @ApiOperation({ summary: '强制插单' })
  async forceInsertion(
    @Body() dto: ForceInsertionDto,
  ): Promise<OrderInsertion> {
    const insertion = this.orderInsertionRepository.create({
      orderId: dto.orderId,
      insertionType: 'FORCE',
      newDemandDate: dto.newDemandDate,
      reason: dto.reason,
      status: 'PENDING',
    });

    return this.orderInsertionRepository.save(insertion);
  }

  @Get()
  @ApiOperation({ summary: '查询插单记录' })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<OrderInsertion[]> {
    const queryBuilder = this.orderInsertionRepository
      .createQueryBuilder('insertion')
      .leftJoinAndSelect('insertion.order', 'order');

    if (type) {
      queryBuilder.andWhere('insertion.insertionType = :type', { type });
    }
    if (status) {
      queryBuilder.andWhere('insertion.status = :status', { status });
    }

    return queryBuilder.orderBy('insertion.createdAt', 'DESC').getMany();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批插单' })
  async approve(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ): Promise<OrderInsertion> {
    await this.orderInsertionRepository.update(id, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    });

    return this.orderInsertionRepository.findOne({ where: { id } });
  }
}

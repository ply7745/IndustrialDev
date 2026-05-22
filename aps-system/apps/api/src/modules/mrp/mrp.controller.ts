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
  MrpRun,
  NetRequirement,
  MaterialRequirement,
  PurchasePlan,
} from '../../../../packages/database/src/entities/aps.entities';

class RunMrpDto {
  horizonStart: Date;
  horizonEnd: Date;
  includeSalesOrders?: boolean;
  includeForecasts?: boolean;
  includeWorkOrders?: boolean;
}

@ApiTags('MRP运算')
@ApiBearerAuth()
@Controller('api/v1/mrp')
export class MrpController {
  constructor(
    @InjectRepository(MrpRun)
    private mrpRunRepository: Repository<MrpRun>,
    @InjectRepository(NetRequirement)
    private netRequirementRepository: Repository<NetRequirement>,
    @InjectRepository(MaterialRequirement)
    private materialRequirementRepository: Repository<MaterialRequirement>,
    @InjectRepository(PurchasePlan)
    private purchasePlanRepository: Repository<PurchasePlan>,
  ) {}

  @Post('run')
  @ApiOperation({ summary: '执行MRP运算' })
  async runMrp(@Body() dto: RunMrpDto): Promise<MrpRun> {
    const runNo = `MRP-${Date.now()}`;

    const mrpRun = this.mrpRunRepository.create({
      runNo,
      planningHorizonStart: dto.horizonStart,
      planningHorizonEnd: dto.horizonEnd,
      startTime: new Date(),
      status: 'RUNNING',
    });

    const savedRun = await this.mrpRunRepository.save(mrpRun);

    try {
      savedRun.status = 'COMPLETED';
      savedRun.endTime = new Date();
      savedRun.totalOrders = 0;
      savedRun.totalRequirements = 0;
      savedRun.shortageCount = 0;
      await this.mrpRunRepository.save(savedRun);

      return savedRun;
    } catch (error) {
      savedRun.status = 'FAILED';
      savedRun.endTime = new Date();
      await this.mrpRunRepository.save(savedRun);
      throw error;
    }
  }

  @Get('runs')
  @ApiOperation({ summary: '查询MRP运行记录' })
  async getRuns(): Promise<MrpRun[]> {
    return this.mrpRunRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  @Get('runs/:id')
  @ApiOperation({ summary: '获取MRP运行详情' })
  async getRun(@Param('id') id: string): Promise<MrpRun> {
    return this.mrpRunRepository.findOne({
      where: { id },
      relations: ['netRequirements'],
    });
  }

  @Get('net-requirements')
  @ApiOperation({ summary: '查询净需求' })
  async getNetRequirements(
    @Query('mrpRunId') mrpRunId?: string,
  ): Promise<NetRequirement[]> {
    const where: any = {};
    if (mrpRunId) where.mrpRunId = mrpRunId;

    return this.netRequirementRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('material-requirements')
  @ApiOperation({ summary: '查询物料需求' })
  async getMaterialRequirements(
    @Query('sourceType') sourceType?: string,
    @Query('status') status?: string,
  ): Promise<MaterialRequirement[]> {
    const queryBuilder = this.materialRequirementRepository
      .createQueryBuilder('req');

    if (sourceType) {
      queryBuilder.andWhere('req.sourceType = :sourceType', { sourceType });
    }
    if (status) {
      queryBuilder.andWhere('req.status = :status', { status });
    }

    return queryBuilder.orderBy('req.requiredDate', 'ASC').getMany();
  }

  @Post('requirements/:id/approve')
  @ApiOperation({ summary: '评审物料需求' })
  async approveRequirement(
    @Param('id') id: string,
  ): Promise<MaterialRequirement> {
    await this.materialRequirementRepository.update(id, {
      status: 'APPROVED',
    });
    return this.materialRequirementRepository.findOne({ where: { id } });
  }
}

@ApiTags('物料需求')
@ApiBearerAuth()
@Controller('api/v1/material-requirements')
export class MaterialRequirementController {
  constructor(
    @InjectRepository(MaterialRequirement)
    private materialRequirementRepository: Repository<MaterialRequirement>,
  ) {}

  @Get()
  @ApiOperation({ summary: '查询物料需求列表' })
  async findAll(
    @Query('sourceType') sourceType?: string,
  ): Promise<MaterialRequirement[]> {
    const where: any = {};
    if (sourceType) where.sourceType = sourceType;

    return this.materialRequirementRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('forecast')
  @ApiOperation({ summary: '预测物料需求' })
  async getForecastRequirements(): Promise<MaterialRequirement[]> {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'FORECAST' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('pre-production')
  @ApiOperation({ summary: '预生产物料需求' })
  async getPreProductionRequirements(): Promise<MaterialRequirement[]> {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'PRE_PRODUCTION' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('work-orders')
  @ApiOperation({ summary: '工单物料需求' })
  async getWorkOrderRequirements(): Promise<MaterialRequirement[]> {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'WORK_ORDER' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('safety-stock')
  @ApiOperation({ summary: '安全库存物料需求' })
  async getSafetyStockRequirements(): Promise<MaterialRequirement[]> {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'SAFETY_STOCK' },
      order: { requiredDate: 'ASC' },
    });
  }
}

@ApiTags('采购计划')
@ApiBearerAuth()
@Controller('api/v1/purchase-plans')
export class PurchasePlanController {
  constructor(
    @InjectRepository(PurchasePlan)
    private purchasePlanRepository: Repository<PurchasePlan>,
    @InjectRepository(NetRequirement)
    private netRequirementRepository: Repository<NetRequirement>,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: '生成采购计划' })
  async generate(@Body('mrpRunId') mrpRunId: string): Promise<PurchasePlan[]> {
    const netRequirements = await this.netRequirementRepository.find({
      where: { mrpRunId, status: 'CALCULATED' },
    });

    const purchasePlans: PurchasePlan[] = [];

    for (const nr of netRequirements) {
      if (nr.orderSuggestion && nr.orderSuggestion > 0) {
        const plan = this.purchasePlanRepository.create({
          planNo: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          materialId: nr.materialId,
          quantity: nr.orderSuggestion,
          requiredDate: nr.requiredDate,
          plannedOrderDate: nr.plannedOrderDate,
          status: 'DRAFT',
        });

        purchasePlans.push(await this.purchasePlanRepository.save(plan));
      }
    }

    return purchasePlans;
  }

  @Get()
  @ApiOperation({ summary: '查询采购计划列表' })
  async findAll(
    @Query('status') status?: string,
  ): Promise<PurchasePlan[]> {
    const where: any = {};
    if (status) where.status = status;

    return this.purchasePlanRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批采购计划' })
  async approve(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ): Promise<PurchasePlan> {
    await this.purchasePlanRepository.update(id, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    });
    return this.purchasePlanRepository.findOne({ where: { id } });
  }
}

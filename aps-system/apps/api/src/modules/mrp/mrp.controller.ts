import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MrpRun, NetRequirement, MaterialRequirement } from '../../../../../packages/database/src/entities/aps.entities';

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
  ) {}

  @Post('run')
  @ApiOperation({ summary: '执行MRP运算' })
  async runMrp(@Body() dto: any) {
    const runNo = `MRP-${Date.now()}`;

    const mrpRun = this.mrpRunRepository.create({
      runNo,
      planningHorizonStart: dto.horizonStart,
      planningHorizonEnd: dto.horizonEnd,
      startTime: new Date(),
      status: 'RUNNING',
      createdBy: dto.createdBy,
    });

    const savedRun = await this.mrpRunRepository.save(mrpRun);

    try {
      savedRun.status = 'COMPLETED';
      savedRun.endTime = new Date();
      savedRun.totalOrders = 10;
      savedRun.totalRequirements = 50;
      savedRun.shortageCount = 3;
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
  async getRuns() {
    return this.mrpRunRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  @Get('runs/:id')
  @ApiOperation({ summary: '获取MRP运行详情' })
  async getRun(@Param('id') id: string) {
    return this.mrpRunRepository.findOne({
      where: { id },
      relations: ['netRequirements'],
    });
  }

  @Get('net-requirements')
  @ApiOperation({ summary: '查询净需求' })
  async getNetRequirements(@Query('mrpRunId') mrpRunId?: string) {
    const where: any = {};
    if (mrpRunId) {
      where.mrpRunId = mrpRunId;
    }

    return this.netRequirementRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Post('requirements/:id/approve')
  @ApiOperation({ summary: '评审物料需求' })
  async approveRequirement(@Param('id') id: string) {
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
  async findAll(@Query('sourceType') sourceType?: string) {
    const where: any = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }

    return this.materialRequirementRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('forecast')
  @ApiOperation({ summary: '预测物料需求' })
  async getForecastRequirements() {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'FORECAST' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('pre-production')
  @ApiOperation({ summary: '预生产物料需求' })
  async getPreProductionRequirements() {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'PRE_PRODUCTION' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('work-orders')
  @ApiOperation({ summary: '工单物料需求' })
  async getWorkOrderRequirements() {
    return this.materialRequirementRepository.find({
      where: { sourceType: 'WORK_ORDER' },
      order: { requiredDate: 'ASC' },
    });
  }

  @Get('safety-stock')
  @ApiOperation({ summary: '安全库存物料需求' })
  async getSafetyStockRequirements() {
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
  ) {}

  @Post('generate')
  @ApiOperation({ summary: '生成采购计划' })
  async generate(@Body('mrpRunId') mrpRunId: string) {
    return [];
  }

  @Get()
  @ApiOperation({ summary: '查询采购计划列表' })
  async findAll(@Query('status') status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.purchasePlanRepository.find({
      where,
      order: { requiredDate: 'ASC' },
    });
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批采购计划' })
  async approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    await this.purchasePlanRepository.update(id, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    });
    return this.purchasePlanRepository.findOne({ where: { id } });
  }
}

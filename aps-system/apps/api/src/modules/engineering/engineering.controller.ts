import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngineeringPlan, EngineeringDocument, EngineeringLock } from '../../../../../packages/database/src/entities/aps.entities';

@ApiTags('工程计划')
@ApiBearerAuth()
@Controller('api/v1/engineering')
export class EngineeringController {
  constructor(
    @InjectRepository(EngineeringPlan)
    private engineeringPlanRepository: Repository<EngineeringPlan>,
    @InjectRepository(EngineeringDocument)
    private engineeringDocumentRepository: Repository<EngineeringDocument>,
    @InjectRepository(EngineeringLock)
    private engineeringLockRepository: Repository<EngineeringLock>,
  ) {}

  @Post('plans')
  @ApiOperation({ summary: '创建工程计划' })
  async createPlan(@Body() dto: any) {
    const plan = this.engineeringPlanRepository.create({
      ...dto,
      planNo: `ENG-${Date.now()}`,
      status: 'DRAFT',
    });
    return this.engineeringPlanRepository.save(plan);
  }

  @Get('plans')
  @ApiOperation({ summary: '查询工程计划列表' })
  async getPlans() {
    return this.engineeringPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Get('plans/:id')
  @ApiOperation({ summary: '获取工程计划详情' })
  async getPlan(@Param('id') id: string) {
    return this.engineeringPlanRepository.findOne({ where: { id } });
  }

  @Put('plans/:id')
  @ApiOperation({ summary: '更新工程计划' })
  async updatePlan(@Param('id') id: string, @Body() dto: any) {
    await this.engineeringPlanRepository.update(id, dto);
    return this.engineeringPlanRepository.findOne({ where: { id } });
  }

  @Post('plans/:id/confirm')
  @ApiOperation({ summary: '确认工程计划' })
  async confirmPlan(@Param('id') id: string) {
    await this.engineeringPlanRepository.update(id, { status: 'CONFIRMED' });
    return this.engineeringPlanRepository.findOne({ where: { id } });
  }

  @Post('documents')
  @ApiOperation({ summary: '创建工程资料' })
  async createDocument(@Body() dto: any) {
    const document = this.engineeringDocumentRepository.create({
      ...dto,
      documentNo: `DOC-${Date.now()}`,
      status: 'PENDING',
    });
    return this.engineeringDocumentRepository.save(document);
  }

  @Get('documents')
  @ApiOperation({ summary: '查询工程资料列表' })
  async getDocuments(@Query() query: any) {
    const where: any = {};
    if (query.materialId) where.materialId = query.materialId;
    if (query.status) where.status = query.status;

    return this.engineeringDocumentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  @Put('documents/:id')
  @ApiOperation({ summary: '更新工程资料' })
  async updateDocument(@Param('id') id: string, @Body() dto: any) {
    await this.engineeringDocumentRepository.update(id, dto);
    return this.engineeringDocumentRepository.findOne({ where: { id } });
  }

  @Post('documents/:id/confirm')
  @ApiOperation({ summary: '确认工程资料' })
  async confirmDocument(@Param('id') id: string, @Body('confirmedBy') confirmedBy: string) {
    await this.engineeringDocumentRepository.update(id, {
      status: 'CONFIRMED',
      confirmedBy,
      confirmedAt: new Date(),
    });
    return this.engineeringDocumentRepository.findOne({ where: { id } });
  }

  @Post('locks')
  @ApiOperation({ summary: '创建工程锁' })
  async createLock(@Body() dto: any) {
    const lock = this.engineeringLockRepository.create({
      ...dto,
      status: 'LOCKED',
    });
    return this.engineeringLockRepository.save(lock);
  }

  @Get('locks')
  @ApiOperation({ summary: '查询工程锁列表' })
  async getLocks(@Query() query: any) {
    const where: any = {};
    if (query.materialId) where.materialId = query.materialId;
    if (query.status) where.status = query.status;

    return this.engineeringLockRepository.find({ where });
  }

  @Post('locks/:id/unlock')
  @ApiOperation({ summary: '解除工程锁' })
  async unlock(@Param('id') id: string) {
    await this.engineeringLockRepository.update(id, {
      status: 'UNLOCKED',
      unlockAt: new Date(),
    });
    return this.engineeringLockRepository.findOne({ where: { id } });
  }
}

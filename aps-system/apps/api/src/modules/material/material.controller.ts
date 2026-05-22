import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, MaterialLock, MaterialSubstitute } from '../../../../../packages/database/src/entities/aps.entities';

@ApiTags('物料控制')
@ApiBearerAuth()
@Controller('api/v1')
export class MaterialController {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(MaterialLock)
    private materialLockRepository: Repository<MaterialLock>,
    @InjectRepository(MaterialSubstitute)
    private materialSubstituteRepository: Repository<MaterialSubstitute>,
  ) {}

  @Get('inventory')
  @ApiOperation({ summary: '查询库存' })
  async getInventory(@Query() query: any) {
    const where: any = {};
    if (query.materialId) where.materialId = query.materialId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;

    return this.inventoryRepository.find({ where });
  }

  @Get('inventory/:materialId')
  @ApiOperation({ summary: '获取物料库存' })
  async getMaterialInventory(@Param('materialId') materialId: string) {
    return this.inventoryRepository.find({ where: { materialId } });
  }

  @Post('inventory/adjust')
  @ApiOperation({ summary: '库存调整' })
  async adjustInventory(@Body() dto: any) {
    const inventory = this.inventoryRepository.create(dto);
    return this.inventoryRepository.save(inventory);
  }

  @Post('material-locks')
  @ApiOperation({ summary: '创建物料锁定' })
  async createLock(@Body() dto: any) {
    const lock = this.materialLockRepository.create({
      ...dto,
      lockNo: `LOCK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'LOCKED',
    });
    return this.materialLockRepository.save(lock);
  }

  @Get('material-locks')
  @ApiOperation({ summary: '查询物料锁定列表' })
  async getLocks(@Query() query: any) {
    const where: any = {};
    if (query.materialId) where.materialId = query.materialId;
    if (query.status) where.status = query.status;

    return this.materialLockRepository.find({ where });
  }

  @Post('material-locks/:id/release')
  @ApiOperation({ summary: '释放物料锁定' })
  async releaseLock(@Param('id') id: string) {
    await this.materialLockRepository.update(id, { status: 'RELEASED' });
    return this.materialLockRepository.findOne({ where: { id } });
  }

  @Post('material-substitutes')
  @ApiOperation({ summary: '创建物料替代' })
  async createSubstitute(@Body() dto: any) {
    const substitute = this.materialSubstituteRepository.create(dto);
    return this.materialSubstituteRepository.save(substitute);
  }

  @Get('material-substitutes')
  @ApiOperation({ summary: '查询物料替代列表' })
  async getSubstitutes() {
    return this.materialSubstituteRepository.find();
  }

  @Get('material-substitutes/:materialId')
  @ApiOperation({ summary: '获取物料替代方案' })
  async getSubstitutesByMaterial(@Param('materialId') materialId: string) {
    return this.materialSubstituteRepository.find({
      where: { originalMaterialId: materialId, isApproved: true },
      order: { priority: 'ASC' },
    });
  }

  @Put('material-substitutes/:id')
  @ApiOperation({ summary: '更新物料替代' })
  async updateSubstitute(@Param('id') id: string, @Body() dto: any) {
    await this.materialSubstituteRepository.update(id, dto);
    return this.materialSubstituteRepository.findOne({ where: { id } });
  }
}

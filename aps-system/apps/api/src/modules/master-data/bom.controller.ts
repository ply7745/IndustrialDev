import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BomService, CreateBomDto, UpdateBomDto, BomQueryDto } from './bom.service';

@ApiTags('BOM管理')
@ApiBearerAuth()
@Controller('api/v1/boms')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post()
  @ApiOperation({ summary: '创建BOM' })
  async create(@Body() dto: CreateBomDto) {
    return this.bomService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询BOM列表' })
  async findAll(@Query() query: BomQueryDto) {
    return this.bomService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取BOM详情' })
  async findOne(@Param('id') id: string) {
    return this.bomService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新BOM' })
  async update(@Param('id') id: string, @Body() dto: UpdateBomDto) {
    return this.bomService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除BOM' })
  async remove(@Param('id') id: string) {
    await this.bomService.remove(id);
    return { message: 'BOM已删除' };
  }

  @Get('parent/:parentMaterialId')
  @ApiOperation({ summary: '获取父物料的BOM' })
  async findByParent(@Param('parentMaterialId') parentMaterialId: string) {
    return this.bomService.findByParent(parentMaterialId);
  }

  @Get('child/:childMaterialId')
  @ApiOperation({ summary: '获取子物料的BOM' })
  async findByChild(@Param('childMaterialId') childMaterialId: string) {
    return this.bomService.findByChild(childMaterialId);
  }

  @Get('material/:materialId')
  @ApiOperation({ summary: '获取物料的完整BOM信息' })
  async getMaterialBoms(@Param('materialId') materialId: string) {
    return this.bomService.getMaterialBoms(materialId);
  }

  @Post(':id/expand')
  @ApiOperation({ summary: '展开BOM' })
  async expandBom(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Query('maxLevel') maxLevel?: number,
  ) {
    const bom = await this.bomService.findOne(id);
    return this.bomService.expandBom(bom.parentMaterialId, quantity, 0, maxLevel || 10);
  }

  @Post('copy/:sourceParentId/:targetParentId')
  @ApiOperation({ summary: '复制BOM' })
  async copyBom(
    @Param('sourceParentId') sourceParentId: string,
    @Param('targetParentId') targetParentId: string,
  ) {
    return this.bomService.copyBom(sourceParentId, targetParentId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialService, CreateMaterialDto, UpdateMaterialDto, MaterialQueryDto } from './material.service';

@ApiTags('物料管理')
@ApiBearerAuth()
@Controller('api/v1/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: '创建物料' })
  async create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询物料列表' })
  async findAll(@Query() query: MaterialQueryDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取物料详情' })
  async findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新物料' })
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物料' })
  async remove(@Param('id') id: string) {
    await this.materialService.remove(id);
    return { message: '物料已删除' };
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码查询物料' })
  async findByCode(@Param('code') code: string) {
    return this.materialService.findByCode(code);
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据类型查询物料' })
  async findByType(@Param('type') type: string) {
    return this.materialService.findByType(type);
  }

  @Get(':id/bom-tree')
  @ApiOperation({ summary: '获取物料BOM树' })
  async getBomTree(
    @Param('id') id: string,
    @Query('level') level?: number,
  ) {
    return this.materialService.getBomTree(id, 0, level || 10);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量导入物料' })
  async batchImport(@Body() materials: CreateMaterialDto[]) {
    return this.materialService.batchImport(materials);
  }
}

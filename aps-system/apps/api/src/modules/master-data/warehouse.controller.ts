import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';

@ApiTags('仓库管理')
@ApiBearerAuth()
@Controller('api/v1/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  async create(@Body() dto: any) {
    return this.warehouseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询仓库列表' })
  async findAll(@Query() query: any) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  async findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  async remove(@Param('id') id: string) {
    await this.warehouseService.remove(id);
    return { message: '仓库已删除' };
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据类型查询仓库' })
  async findByType(@Param('type') type: string) {
    return this.warehouseService.findByType(type);
  }

  @Get('active/list')
  @ApiOperation({ summary: '获取活跃仓库列表' })
  async findActive() {
    return this.warehouseService.findActive();
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReplenishmentOrderService } from './replenishment-order.service';

@ApiTags('补投单管理')
@ApiBearerAuth()
@Controller('api/v1/replenishment-orders')
export class ReplenishmentOrderController {
  constructor(private readonly replenishmentOrderService: ReplenishmentOrderService) {}

  @Post()
  @ApiOperation({ summary: '创建补投单' })
  async create(@Body() dto: any) {
    return this.replenishmentOrderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询补投单列表' })
  async findAll(@Query() query: any) {
    return this.replenishmentOrderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取补投单详情' })
  async findOne(@Param('id') id: string) {
    return this.replenishmentOrderService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新补投单' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.replenishmentOrderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除补投单' })
  async remove(@Param('id') id: string) {
    await this.replenishmentOrderService.remove(id);
    return { message: '补投单已删除' };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批补投单' })
  async approve(@Param('id') id: string) {
    return this.replenishmentOrderService.approve(id);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量导入补投单' })
  async batchImport(@Body() orders: any[]) {
    return this.replenishmentOrderService.batchImport(orders);
  }
}

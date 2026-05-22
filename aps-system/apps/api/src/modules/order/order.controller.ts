import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('订单管理')
@ApiBearerAuth()
@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Body() dto: any) {
    return this.orderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询订单列表' })
  async findAll(@Query() query: any) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新订单' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  async remove(@Param('id') id: string) {
    await this.orderService.remove(id);
    return { message: '订单已删除' };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '订单评审通过' })
  async approve(@Param('id') id: string) {
    return this.orderService.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '订单评审拒绝' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.orderService.reject(id, reason);
  }

  @Post(':id/split')
  @ApiOperation({ summary: '订单拆分' })
  async split(@Param('id') id: string, @Body() dto: any) {
    return this.orderService.split(id, dto);
  }

  @Post(':id/change')
  @ApiOperation({ summary: '订单变更' })
  async change(@Param('id') id: string, @Body() dto: any) {
    return this.orderService.change(id, dto);
  }

  @Get('pending-review/list')
  @ApiOperation({ summary: '待评审订单列表' })
  async getPendingReview() {
    return this.orderService.getPendingReviewOrders();
  }

  @Get('approved/list')
  @ApiOperation({ summary: '已评审订单列表' })
  async getApprovedOrders(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.getApprovedOrders(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('batch')
  @ApiOperation({ summary: '批量导入订单' })
  async batchImport(@Body() orders: any[]) {
    return this.orderService.batchImport(orders);
  }
}

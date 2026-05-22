import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OperationService } from './operation.service';

@ApiTags('工序管理')
@ApiBearerAuth()
@Controller('api/v1/operations')
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Post()
  @ApiOperation({ summary: '创建工序' })
  async create(@Body() dto: any) {
    return this.operationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询工序列表' })
  async findAll(@Query() query: any) {
    return this.operationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工序详情' })
  async findOne(@Param('id') id: string) {
    return this.operationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工序' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.operationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除工序' })
  async remove(@Param('id') id: string) {
    await this.operationService.remove(id);
    return { message: '工序已删除' };
  }

  @Get('workcenter/:workcenterId')
  @ApiOperation({ summary: '获取工作中心的工序列表' })
  async findByWorkcenter(@Param('workcenterId') workcenterId: string) {
    return this.operationService.findByWorkcenter(workcenterId);
  }

  @Get(':id/calculate-time')
  @ApiOperation({ summary: '计算工序加工时间' })
  async calculateProcessingTime(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
  ) {
    return this.operationService.calculateProcessingTime(id, quantity);
  }

  @Post('calculate-total-time')
  @ApiOperation({ summary: '计算总加工时间' })
  async calculateTotalTime(
    @Body('operationIds') operationIds: string[],
    @Body('quantity') quantity: number,
  ) {
    return this.operationService.calculateTotalTime(operationIds, quantity);
  }

  @Get('sequence/:materialId')
  @ApiOperation({ summary: '获取工序顺序' })
  async getOperationSequence(@Param('materialId') materialId: string) {
    return this.operationService.getOperationSequence(materialId);
  }
}

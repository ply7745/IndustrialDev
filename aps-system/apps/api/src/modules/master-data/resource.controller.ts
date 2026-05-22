import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResourceService } from './resource.service';

@ApiTags('资源管理')
@ApiBearerAuth()
@Controller('api/v1/resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: '创建资源' })
  async create(@Body() dto: any) {
    return this.resourceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询资源列表' })
  async findAll(@Query() query: any) {
    return this.resourceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取资源详情' })
  async findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新资源' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.resourceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除资源' })
  async remove(@Param('id') id: string) {
    await this.resourceService.remove(id);
    return { message: '资源已删除' };
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据类型查询资源' })
  async findByType(@Param('type') type: string) {
    return this.resourceService.findByType(type);
  }

  @Get('workcenters/list')
  @ApiOperation({ summary: '获取工作中心列表' })
  async findWorkcenters() {
    return this.resourceService.findWorkcenters();
  }

  @Get('machines/list')
  @ApiOperation({ summary: '获取机器设备列表' })
  async findMachines() {
    return this.resourceService.findMachines();
  }

  @Get(':id/calendar')
  @ApiOperation({ summary: '获取资源日历' })
  async getCalendar(@Param('id') id: string) {
    const resource = await this.resourceService.findOne(id);
    return { calendarId: resource.calendarId };
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: '计算资源产能' })
  async calculateCapacity(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.resourceService.calculateCapacity(
      id,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

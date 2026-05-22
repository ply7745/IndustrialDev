import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';

@ApiTags('日历管理')
@ApiBearerAuth()
@Controller('api/v1/calendars')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: '创建日历' })
  async create(@Body() dto: any) {
    return this.calendarService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询日历列表' })
  async findAll(@Query() query: any) {
    return this.calendarService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取日历详情' })
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新日历' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.calendarService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除日历' })
  async remove(@Param('id') id: string) {
    await this.calendarService.remove(id);
    return { message: '日历已删除' };
  }

  @Get(':id/workdays')
  @ApiOperation({ summary: '获取工作日列表' })
  async getWorkdays(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getWorkdays(id, new Date(startDate), new Date(endDate));
  }

  @Get(':id/is-workday')
  @ApiOperation({ summary: '判断是否为工作日' })
  async isWorkday(@Param('id') id: string, @Query('date') date: string) {
    return this.calendarService.isWorkday(id, new Date(date));
  }

  @Get(':id/next-workday')
  @ApiOperation({ summary: '获取下一个工作日' })
  async getNextWorkday(@Param('id') id: string, @Query('startDate') startDate: string) {
    return this.calendarService.getNextWorkday(id, new Date(startDate));
  }

  @Get(':id/add-workdays')
  @ApiOperation({ summary: '添加工作日' })
  async addWorkdays(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('days') days: number,
  ) {
    return this.calendarService.addWorkdays(id, new Date(startDate), days);
  }
}

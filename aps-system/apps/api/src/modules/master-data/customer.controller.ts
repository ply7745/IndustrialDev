import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService, CreateCustomerDto, UpdateCustomerDto } from './customer.service';

@ApiTags('客户管理')
@ApiBearerAuth()
@Controller('api/v1/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: '创建客户' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询客户列表' })
  async findAll(@Query() query: any) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  async remove(@Param('id') id: string) {
    await this.customerService.remove(id);
    return { message: '客户已删除' };
  }

  @Get('active/list')
  @ApiOperation({ summary: '获取活跃客户列表' })
  async findActive() {
    return this.customerService.findActive();
  }
}

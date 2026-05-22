import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { Salary } from './salary.entity';

@Controller('api/salaries')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  async findAll(): Promise<Salary[]> {
    return this.salaryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Salary> {
    return this.salaryService.findOne(id);
  }

  @Post()
  async create(@Body() salaryData: Partial<Salary>): Promise<Salary> {
    return this.salaryService.create(salaryData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() salaryData: Partial<Salary>,
  ): Promise<Salary> {
    return this.salaryService.update(id, salaryData);
  }

  @Put(':id/paid')
  async markAsPaid(@Param('id') id: string): Promise<Salary> {
    return this.salaryService.markAsPaid(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.salaryService.remove(id);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string): Promise<Salary[]> {
    return this.salaryService.findByEmployee(employeeId);
  }
}

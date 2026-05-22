import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';

@Controller('api/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Post()
  async create(@Body() employeeData: Partial<Employee>): Promise<Employee> {
    return this.employeeService.create(employeeData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() employeeData: Partial<Employee>,
  ): Promise<Employee> {
    return this.employeeService.update(id, employeeData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string): Promise<Employee[]> {
    return this.employeeService.findByCompany(companyId);
  }

  @Post('ocr')
  async ocr(@Body() body: any): Promise<any> {
    return { success: true, message: 'OCR功能待实现' };
  }
}

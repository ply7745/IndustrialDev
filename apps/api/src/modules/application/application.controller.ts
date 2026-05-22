import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application } from './application.entity';

@Controller('api/applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async findAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Application> {
    return this.applicationService.findOne(id);
  }

  @Post()
  async create(@Body() applicationData: Partial<Application>): Promise<Application> {
    return this.applicationService.create(applicationData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() applicationData: Partial<Application>,
  ): Promise<Application> {
    return this.applicationService.update(id, applicationData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.applicationService.remove(id);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string): Promise<Application[]> {
    return this.applicationService.findByEmployee(employeeId);
  }

  @Get('position/:positionId')
  async findByPosition(@Param('positionId') positionId: string): Promise<Application[]> {
    return this.applicationService.findByPosition(positionId);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PositionService } from './position.service';
import { Position } from './position.entity';

@Controller('api/positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  async findAll(): Promise<Position[]> {
    return this.positionService.findAll();
  }

  @Get('published')
  async findPublished(): Promise<Position[]> {
    return this.positionService.findPublished();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Position> {
    return this.positionService.findOne(id);
  }

  @Post()
  async create(@Body() positionData: Partial<Position>): Promise<Position> {
    return this.positionService.create(positionData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() positionData: Partial<Position>,
  ): Promise<Position> {
    return this.positionService.update(id, positionData);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string): Promise<Position> {
    return this.positionService.publish(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.positionService.remove(id);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string): Promise<Position[]> {
    return this.positionService.findByCompany(companyId);
  }
}

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionOrder } from './production.entity';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  findAll(): Promise<ProductionOrder[]> {
    return this.productionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductionOrder> {
    return this.productionService.findOne(id);
  }

  @Post()
  create(@Body() order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    return this.productionService.create(order);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    return this.productionService.update(id, order);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productionService.remove(id);
  }

  @Post(':id/start')
  start(@Param('id') id: string): Promise<ProductionOrder> {
    return this.productionService.startProduction(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string): Promise<ProductionOrder> {
    return this.productionService.completeProduction(id);
  }
}
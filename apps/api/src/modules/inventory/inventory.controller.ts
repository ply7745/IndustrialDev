import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Post('in')
  stockIn(@Body() data: { sku: string; name: string; quantity: number; location?: string }) {
    return this.inventoryService.stockIn(data);
  }

  @Post('out')
  stockOut(@Body() data: { sku: string; quantity: number }) {
    return this.inventoryService.stockOut(data);
  }

  @Post('transfer')
  transfer(@Body() data: { sku: string; quantity: number; fromLocation: string; toLocation: string }) {
    return this.inventoryService.transfer(data);
  }
}
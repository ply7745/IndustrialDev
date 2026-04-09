import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post('maintenance')
  scheduleMaintenance(@Body() data: { equipmentId: string; date: string; type: string }) {
    return this.equipmentService.scheduleMaintenance(data);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.equipmentService.start(id);
  }

  @Post(':id/stop')
  stop(@Param('id') id: string) {
    return this.equipmentService.stop(id);
  }
}
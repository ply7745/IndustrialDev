import { Controller, Get, Post, Body } from '@nestjs/common';
import { QualityService } from './quality.service';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get()
  findAll() {
    return this.qualityService.findAll();
  }

  @Post()
  createCheck(@Body() data: { orderNo: string; type: string; inspector: string }) {
    return this.qualityService.createCheck(data);
  }

  @Post('execute')
  executeCheck(@Body() data: { checkId: string; result: 'passed' | 'failed'; defects?: string[] }) {
    return this.qualityService.executeCheck(data);
  }
}
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'IndustrialDev API',
    };
  }

  @Get('modules')
  getModules() {
    return {
      modules: [
        { name: 'MES', description: '生产管理系统' },
        { name: 'WMS', description: '仓储管理系统' },
        { name: 'QMS', description: '质量管理系统' },
        { name: 'EMS', description: '设备管理系统' },
      ],
    };
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: '欢迎使用工业信息化管理系统 API',
      version: '1.0.0',
      documentation: '/api/docs',
    };
  }
}
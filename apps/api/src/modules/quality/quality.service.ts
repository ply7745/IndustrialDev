import { Injectable } from '@nestjs/common';

@Injectable()
export class QualityService {
  private checks: any[] = [
    { id: '1', orderNo: 'QC-001', type: 'incoming', status: 'passed', inspector: '张工', checkTime: new Date() },
    { id: '2', orderNo: 'QC-002', type: 'process', status: 'pending', inspector: '李工' },
    { id: '3', orderNo: 'QC-003', type: 'final', status: 'failed', inspector: '王工', defects: ['尺寸偏差'] },
  ];

  findAll() {
    return this.checks;
  }

  createCheck(data: { orderNo: string; type: string; inspector: string }) {
    const newCheck = {
      id: `${Date.now()}`,
      ...data,
      status: 'pending',
    };
    this.checks.push(newCheck);
    return newCheck;
  }

  executeCheck(data: { checkId: string; result: 'passed' | 'failed'; defects?: string[] }) {
    const check = this.checks.find(c => c.id === data.checkId);
    if (!check) throw new Error('检验单不存在');
    check.status = data.result;
    check.checkTime = new Date();
    if (data.defects) check.defects = data.defects;
    return check;
  }
}
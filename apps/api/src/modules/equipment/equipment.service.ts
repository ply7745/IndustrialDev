import { Injectable } from '@nestjs/common';

@Injectable()
export class EquipmentService {
  private equipment: any[] = [
    { id: '1', name: '数控机床-01', code: 'CNC-001', status: 'running', location: '车间A' },
    { id: '2', name: '焊接机器人-01', code: 'WELD-001', status: 'maintenance', location: '车间B' },
    { id: '3', name: '注塑机-01', code: 'INJ-001', status: 'idle', location: '车间C' },
  ];

  findAll() {
    return this.equipment;
  }

  findOne(id: string) {
    return this.equipment.find(e => e.id === id);
  }

  scheduleMaintenance(data: { equipmentId: string; date: string; type: string }) {
    const equipment = this.findOne(data.equipmentId);
    if (!equipment) throw new Error('设备不存在');
    return {
      ...equipment,
      nextMaintenance: data.date,
      maintenanceType: data.type,
    };
  }

  start(id: string) {
    const equipment = this.findOne(id);
    if (!equipment) throw new Error('设备不存在');
    equipment.status = 'running';
    return equipment;
  }

  stop(id: string) {
    const equipment = this.findOne(id);
    if (!equipment) throw new Error('设备不存在');
    equipment.status = 'idle';
    return equipment;
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  private inventory: any[] = [
    { id: '1', sku: 'SKU-001', name: '原材料A', quantity: 500, location: 'A区' },
    { id: '2', sku: 'SKU-002', name: '原材料B', quantity: 300, location: 'B区' },
    { id: '3', sku: 'SKU-003', name: '半成品C', quantity: 100, location: 'C区' },
  ];

  findAll() {
    return this.inventory;
  }

  stockIn(data: { sku: string; name: string; quantity: number; location?: string }) {
    const existing = this.inventory.find(i => i.sku === data.sku);
    if (existing) {
      existing.quantity += data.quantity;
      return existing;
    }
    const newItem = {
      id: `${Date.now()}`,
      ...data,
      location: data.location || '默认库区',
    };
    this.inventory.push(newItem);
    return newItem;
  }

  stockOut(data: { sku: string; quantity: number }) {
    const item = this.inventory.find(i => i.sku === data.sku);
    if (!item || item.quantity < data.quantity) {
      throw new Error('库存不足');
    }
    item.quantity -= data.quantity;
    return item;
  }

  transfer(data: { sku: string; quantity: number; fromLocation: string; toLocation: string }) {
    const item = this.inventory.find(i => i.sku === data.sku);
    if (!item) throw new Error('SKU不存在');
    if (item.location !== data.fromLocation) throw new Error('源位置不匹配');
    item.location = data.toLocation;
    return item;
  }
}
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Warehouse } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(dto: any): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`仓库编码 ${dto.code} 已存在`);
    }

    const warehouse = this.warehouseRepository.create({
      ...dto,
      status: 'ACTIVE',
    });

    return this.warehouseRepository.save(warehouse);
  }

  async findAll(query: any): Promise<{ list: Warehouse[]; total: number }> {
    const where: any = {};

    if (query.code) {
      where.code = Like(`%${query.code}%`);
    }
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.warehouseRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(`仓库 ${id} 不存在`);
    }

    return warehouse;
  }

  async update(id: string, dto: any): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, dto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    warehouse.status = 'INACTIVE';
    await this.warehouseRepository.save(warehouse);
  }

  async findByType(type: string): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: { type, status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: { status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }
}

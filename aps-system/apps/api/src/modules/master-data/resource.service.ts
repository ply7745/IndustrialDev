import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Resource } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async create(dto: any): Promise<Resource> {
    const existing = await this.resourceRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`资源编码 ${dto.code} 已存在`);
    }

    const resource = this.resourceRepository.create({
      ...dto,
      status: 'ACTIVE',
    });

    return this.resourceRepository.save(resource);
  }

  async findAll(query: any): Promise<{ list: Resource[]; total: number }> {
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

    const [list, total] = await this.resourceRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`资源 ${id} 不存在`);
    }

    return resource;
  }

  async update(id: string, dto: any): Promise<Resource> {
    const resource = await this.findOne(id);
    Object.assign(resource, dto);
    return this.resourceRepository.save(resource);
  }

  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);
    resource.status = 'INACTIVE';
    await this.resourceRepository.save(resource);
  }

  async findByType(type: string): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { type, status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  async findWorkcenters(): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { type: 'WORKCENTER', status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  async findMachines(): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { type: 'MACHINE', status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  async calculateCapacity(resourceId: string, startDate: Date, endDate: Date): Promise<number> {
    const resource = await this.findOne(resourceId);
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const hoursPerDay = 8;
    
    return days * hoursPerDay * Number(resource.capacity) * Number(resource.efficiency);
  }
}

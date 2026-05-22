import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Operation } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(Operation)
    private operationRepository: Repository<Operation>,
  ) {}

  async create(dto: any): Promise<Operation> {
    const existing = await this.operationRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`工序编码 ${dto.code} 已存在`);
    }

    const operation = this.operationRepository.create({
      ...dto,
      isBottleneck: dto.isBottleneck || false,
      priority: dto.priority || 1,
    });

    return this.operationRepository.save(operation);
  }

  async findAll(query: any): Promise<{ list: Operation[]; total: number }> {
    const where: any = {};

    if (query.code) {
      where.code = Like(`%${query.code}%`);
    }
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.workcenterId) {
      where.workcenterId = query.workcenterId;
    }
    if (query.isBottleneck !== undefined) {
      where.isBottleneck = query.isBottleneck;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.operationRepository.findAndCount({
      where,
      relations: ['workcenter'],
      order: { priority: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<Operation> {
    const operation = await this.operationRepository.findOne({
      where: { id },
      relations: ['workcenter'],
    });

    if (!operation) {
      throw new NotFoundException(`工序 ${id} 不存在`);
    }

    return operation;
  }

  async update(id: string, dto: any): Promise<Operation> {
    const operation = await this.findOne(id);
    Object.assign(operation, dto);
    return this.operationRepository.save(operation);
  }

  async remove(id: string): Promise<void> {
    const operation = await this.findOne(id);
    await this.operationRepository.remove(operation);
  }

  async findByWorkcenter(workcenterId: string): Promise<Operation[]> {
    return this.operationRepository.find({
      where: { workcenterId },
      order: { priority: 'ASC' },
    });
  }

  async calculateProcessingTime(operationId: string, quantity: number): Promise<number> {
    const operation = await this.findOne(operationId);

    const setupTime = Number(operation.setupTime) || 0;
    const processTime = Number(operation.processTime) || 1;
    const queueTime = Number(operation.queueTime) || 0;
    const waitTime = Number(operation.waitTime) || 0;
    const transferTime = Number(operation.transferTime) || 0;

    const totalProcessTime = setupTime + processTime * quantity + queueTime * (quantity > 1 ? quantity - 1 : 0);

    return totalProcessTime + waitTime + transferTime;
  }

  async calculateTotalTime(operationIds: string[], quantity: number): Promise<number> {
    let totalTime = 0;

    for (const id of operationIds) {
      totalTime += await this.calculateProcessingTime(id, quantity);
    }

    return totalTime;
  }

  async getOperationSequence(materialId: string): Promise<Operation[]> {
    return this.operationRepository.find({
      where: { workcenterId: null },
      order: { priority: 'ASC' },
    });
  }
}

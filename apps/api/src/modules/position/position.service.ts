import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async findAll(): Promise<Position[]> {
    return this.positionRepository.find({ relations: ['company'] });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async create(positionData: Partial<Position>): Promise<Position> {
    const position = this.positionRepository.create(positionData);
    return this.positionRepository.save(position);
  }

  async update(id: string, positionData: Partial<Position>): Promise<Position> {
    const position = await this.findOne(id);
    Object.assign(position, positionData);
    return this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.remove(position);
  }

  async publish(id: string): Promise<Position> {
    const position = await this.findOne(id);
    position.status = 'published';
    position.publishDate = new Date();
    return this.positionRepository.save(position);
  }

  async findPublished(): Promise<Position[]> {
    return this.positionRepository.find({
      where: { status: 'published' },
      relations: ['company'],
    });
  }

  async findByCompany(companyId: string): Promise<Position[]> {
    return this.positionRepository.find({
      where: { companyId },
      relations: ['company'],
    });
  }
}

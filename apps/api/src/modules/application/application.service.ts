import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find({ relations: ['employee', 'position'] });
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['employee', 'position'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async create(applicationData: Partial<Application>): Promise<Application> {
    const application = this.applicationRepository.create(applicationData);
    application.applyDate = new Date();
    return this.applicationRepository.save(application);
  }

  async update(id: string, applicationData: Partial<Application>): Promise<Application> {
    const application = await this.findOne(id);
    Object.assign(application, applicationData);
    return this.applicationRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }

  async findByEmployee(employeeId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { employeeId },
      relations: ['employee', 'position'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPosition(positionId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { positionId },
      relations: ['employee', 'position'],
      order: { createdAt: 'DESC' },
    });
  }
}

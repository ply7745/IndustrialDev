import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../../../../../packages/database/src/entities/aps.entities';

export interface CreateCustomerDto {
  code: string;
  name: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  paymentTerms?: string;
  creditLimit?: number;
}

export interface UpdateCustomerDto {
  name?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  paymentTerms?: string;
  creditLimit?: number;
  status?: string;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`客户编码 ${dto.code} 已存在`);
    }

    const customer = this.customerRepository.create({
      ...dto,
      status: 'ACTIVE',
    });

    return this.customerRepository.save(customer);
  }

  async findAll(query: {
    code?: string;
    name?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Customer[]; total: number }> {
    const where: any = {};

    if (query.code) {
      where.code = Like(`%${query.code}%`);
    }
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.customerRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${id} 不存在`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    customer.status = 'INACTIVE';
    await this.customerRepository.save(customer);
  }

  async findActive(): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }
}

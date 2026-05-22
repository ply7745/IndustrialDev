import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './salary.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepository: Repository<Salary>,
  ) {}

  async findAll(): Promise<Salary[]> {
    return this.salaryRepository.find({ relations: ['employee'] });
  }

  async findOne(id: string): Promise<Salary> {
    const salary = await this.salaryRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!salary) {
      throw new NotFoundException('Salary not found');
    }
    return salary;
  }

  async create(salaryData: Partial<Salary>): Promise<Salary> {
    const salary = this.salaryRepository.create(salaryData);
    salary.totalSalary = (salary.baseSalary || 0) + (salary.performanceSalary || 0) + (salary.allowance || 0);
    salary.actualSalary = salary.totalSalary - (salary.deduction || 0);
    return this.salaryRepository.save(salary);
  }

  async update(id: string, salaryData: Partial<Salary>): Promise<Salary> {
    const salary = await this.findOne(id);
    Object.assign(salary, salaryData);
    salary.totalSalary = (salary.baseSalary || 0) + (salary.performanceSalary || 0) + (salary.allowance || 0);
    salary.actualSalary = salary.totalSalary - (salary.deduction || 0);
    return this.salaryRepository.save(salary);
  }

  async remove(id: string): Promise<void> {
    const salary = await this.findOne(id);
    await this.salaryRepository.remove(salary);
  }

  async findByEmployee(employeeId: string): Promise<Salary[]> {
    return this.salaryRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async markAsPaid(id: string): Promise<Salary> {
    const salary = await this.findOne(id);
    salary.status = 'paid';
    salary.paidDate = new Date();
    return this.salaryRepository.save(salary);
  }
}

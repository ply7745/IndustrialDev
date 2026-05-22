import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({ relations: ['company'] });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, employeeData);
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async findByCompany(companyId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { companyId },
      relations: ['company'],
    });
  }

  async getBirthdayEmployees(): Promise<Employee[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return this.employeeRepository
      .createQueryBuilder('employee')
      .where('EXTRACT(MONTH FROM employee.birthday) = :month', { month })
      .andWhere('EXTRACT(DAY FROM employee.birthday) = :day', { day })
      .getMany();
  }
}

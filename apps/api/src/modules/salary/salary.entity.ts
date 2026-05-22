import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  performanceSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualSalary: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  paidDate: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

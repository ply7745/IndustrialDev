import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 18, nullable: true })
  unifiedCreditCode: string;

  @Column({ length: 100, nullable: true })
  contactPerson: string;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  businessScope: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'date', nullable: true })
  cooperationDate: Date;

  @OneToMany(() => Employee, employee => employee.company)
  employees: Employee[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

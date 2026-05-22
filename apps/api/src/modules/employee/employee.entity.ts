import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../company/company.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 18, unique: true })
  idCard: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  emergencyContact: string;

  @Column({ length: 20, nullable: true })
  emergencyPhone: string;

  @Column({ type: 'date', nullable: true })
  entryDate: Date;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

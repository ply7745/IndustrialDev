import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { Position } from '../position/position.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  positionId: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'positionId' })
  position: Position;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  applyDate: Date;

  @Column({ type: 'datetime', nullable: true })
  interviewDate: Date;

  @Column({ type: 'text', nullable: true })
  interviewResult: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

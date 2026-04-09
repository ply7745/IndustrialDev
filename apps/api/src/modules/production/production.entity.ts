import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('production_orders')
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  orderNo: string;

  @Column({ length: 50 })
  productCode: string;

  @Column({ length: 200 })
  productName: string;

  @Column('int')
  quantity: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date | null;

  @Column({ length: 100, nullable: true })
  assignedTo: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
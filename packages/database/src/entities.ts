import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({ length: 20 })
  role: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ length: 100, nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  warehouseId: string;

  @Column({ length: 50 })
  sku: string;

  @Column({ length: 200 })
  name: string;

  @Column('int')
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
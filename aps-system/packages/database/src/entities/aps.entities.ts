import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('calendar_plan')
export class CalendarPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'jsonb' })
  workDays: object;

  @Column({ type: 'jsonb', nullable: true })
  shiftPatterns: object;

  @Column({ type: 'jsonb', nullable: true })
  holidays: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  minLotSize: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  maxLotSize: number;

  @Column({ type: 'int', default: 0 })
  leadTime: number;

  @Column({ type: 'int', default: 0 })
  bomLevel: number;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BOM, (bom) => bom.parentMaterial)
  parentBoms: BOM[];

  @OneToMany(() => BOM, (bom) => bom.childMaterial)
  childBoms: BOM[];
}

@Entity('bom')
export class BOM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  parentMaterialId: string;

  @ManyToOne(() => Material, (material) => material.parentBoms)
  @JoinColumn({ name: 'parentMaterialId' })
  parentMaterial: Material;

  @Column({ type: 'uuid' })
  childMaterialId: string;

  @ManyToOne(() => Material, (material) => material.childBoms)
  @JoinColumn({ name: 'childMaterialId' })
  childMaterial: Material;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  scrapRate: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: false })
  isAlternative: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactEmail: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentTerms: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  creditLimit: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SalesOrder, (order) => order.customer)
  orders: SalesOrder[];
}

@Entity('warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  capacity: number;

  @Column({ type: 'uuid', nullable: true })
  parentWarehouseId: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Inventory, (inventory) => inventory.warehouse)
  inventories: Inventory[];
}

@Entity('resource')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  workcenterId: string;

  @Column({ type: 'uuid', nullable: true })
  calendarId: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  capacity: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  utilization: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  costPerHour: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Operation, (op) => op.workcenter)
  operations: Operation[];
}

@Entity('operation')
export class Operation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  workcenterId: string;

  @ManyToOne(() => Resource, (resource) => resource.operations)
  @JoinColumn({ name: 'workcenterId' })
  workcenter: Resource;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  standardTime: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  setupTime: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  processTime: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  queueTime: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  waitTime: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  transferTime: number;

  @Column({ type: 'boolean', default: false })
  isBottleneck: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('sales_order')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNo: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'varchar', length: 20 })
  orderType: string;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  demandDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  deliveredQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  approvalStatus: string;

  @Column({ type: 'uuid', nullable: true })
  contractId: string;

  @Column({ type: 'uuid', nullable: true })
  materialId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderSplit, (split) => split.originalOrder)
  splits: OrderSplit[];

  @OneToMany(() => OrderChange, (change) => change.order)
  changes: OrderChange[];

  @OneToMany(() => OrderInsertion, (insertion) => insertion.order)
  insertions: OrderInsertion[];
}

@Entity('order_split')
export class OrderSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  originalOrderId: string;

  @ManyToOne(() => SalesOrder, (order) => order.splits)
  @JoinColumn({ name: 'originalOrderId' })
  originalOrder: SalesOrder;

  @Column({ type: 'varchar', length: 50 })
  splitOrderNo: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  splitQuantity: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  splitReason: string;

  @Column({ type: 'date', nullable: true })
  demandDate: Date;

  @Column({ type: 'int', nullable: true })
  priority: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('order_change')
export class OrderChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => SalesOrder, (order) => order.changes)
  @JoinColumn({ name: 'orderId' })
  order: SalesOrder;

  @Column({ type: 'varchar', length: 20 })
  changeType: string;

  @Column({ type: 'text', nullable: true })
  originalValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  changeReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  changedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'APPLIED' })
  status: string;
}

@Entity('replenishment_order')
export class ReplenishmentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNo: string;

  @Column({ type: 'uuid', nullable: true })
  originalOrderId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reason: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'date', nullable: true })
  demandDate: Date;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'uuid', nullable: true })
  materialId: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('engineering_plan')
export class EngineeringPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  planNo: string;

  @Column({ type: 'uuid', nullable: true })
  materialId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: string;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('engineering_document')
export class EngineeringDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  documentNo: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  fileUrl: string;

  @Column({ type: 'uuid', nullable: true })
  materialId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  confirmedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('engineering_lock')
export class EngineeringLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'varchar', length: 20 })
  lockType: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lockedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lockedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  unlockAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'LOCKED' })
  status: string;
}

@Entity('scheduling_plan')
export class SchedulingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  planNo: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  planningHorizonStart: Date;

  @Column({ type: 'date', nullable: true })
  planningHorizonEnd: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  algorithm: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  optimizationTarget: string;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SchedulingResult, (result) => result.plan)
  results: SchedulingResult[];
}

@Entity('scheduling_result')
export class SchedulingResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  planId: string;

  @ManyToOne(() => SchedulingPlan, (plan) => plan.results)
  @JoinColumn({ name: 'planId' })
  plan: SchedulingPlan;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'uuid', nullable: true })
  workOrderId: string;

  @Column({ type: 'uuid', nullable: true })
  operationId: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'timestamp' })
  plannedStartTime: Date;

  @Column({ type: 'timestamp' })
  plannedEndTime: Date;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  plannedQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'varchar', length: 20, default: 'PLANNED' })
  status: string;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  delayHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('bottleneck_analysis')
export class BottleneckAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workcenterId: string;

  @Column({ type: 'date' })
  analysisDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  utilizationRate: number;

  @Column({ type: 'int', nullable: true })
  queueLength: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  avgWaitTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  capacityLoad: number;

  @Column({ type: 'boolean', default: false })
  isBottleneck: boolean;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('order_insertion')
export class OrderInsertion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => SalesOrder, (order) => order.insertions)
  @JoinColumn({ name: 'orderId' })
  order: SalesOrder;

  @Column({ type: 'varchar', length: 20 })
  insertionType: string;

  @Column({ type: 'date', nullable: true })
  originalDemandDate: Date;

  @Column({ type: 'date', nullable: true })
  newDemandDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string;

  @Column({ type: 'jsonb', nullable: true })
  impactedOrders: object[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('work_order')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNo: string;

  @Column({ type: 'varchar', length: 20 })
  sourceType: string;

  @Column({ type: 'uuid', nullable: true })
  sourceOrderId: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  completedQuantity: number;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'uuid', nullable: true })
  workcenterId: string;

  @Column({ type: 'varchar', length: 20, default: 'RELEASED' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lockReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WorkOrderSplit, (split) => split.originalWorkOrder)
  splits: WorkOrderSplit[];
}

@Entity('work_order_split')
export class WorkOrderSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  originalWorkOrderId: string;

  @ManyToOne(() => WorkOrder, (wo) => wo.splits)
  @JoinColumn({ name: 'originalWorkOrderId' })
  originalWorkOrder: WorkOrder;

  @Column({ type: 'varchar', length: 50 })
  splitOrderNo: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  splitQuantity: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  splitReason: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('material_requirement')
export class MaterialRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  requirementNo: string;

  @Column({ type: 'varchar', length: 20 })
  sourceType: string;

  @Column({ type: 'uuid', nullable: true })
  sourceId: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  requiredQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  allocatedQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  shortageQuantity: number;

  @Column({ type: 'date', nullable: true })
  requiredDate: Date;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('mrp_run')
export class MrpRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  runNo: string;

  @Column({ type: 'date', nullable: true })
  planningHorizonStart: Date;

  @Column({ type: 'date', nullable: true })
  planningHorizonEnd: Date;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'varchar', length: 20, default: 'RUNNING' })
  status: string;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'int', default: 0 })
  totalRequirements: number;

  @Column({ type: 'int', default: 0 })
  shortageCount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NetRequirement, (nr) => nr.mrpRun)
  netRequirements: NetRequirement[];
}

@Entity('net_requirement')
export class NetRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mrpRunId: string;

  @ManyToOne(() => MrpRun, (run) => run.netRequirements)
  @JoinColumn({ name: 'mrpRunId' })
  mrpRun: MrpRun;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  grossRequirement: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  scheduledReceipts: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  onHandQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  netRequirement: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  orderSuggestion: number;

  @Column({ type: 'date', nullable: true })
  requiredDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedOrderDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'CALCULATED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('forecast_consumption')
export class ForecastConsumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  forecastOrderId: string;

  @Column({ type: 'uuid', nullable: true })
  salesOrderId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  consumedQuantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  consumedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('kits_analysis')
export class KitsAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  analysisNo: string;

  @Column({ type: 'varchar', length: 20 })
  sourceType: string;

  @Column({ type: 'uuid' })
  sourceId: string;

  @Column({ type: 'date' })
  analysisDate: Date;

  @Column({ type: 'date', nullable: true })
  requiredDate: Date;

  @Column({ type: 'int', default: 0 })
  totalLines: number;

  @Column({ type: 'int', default: 0 })
  kitLines: number;

  @Column({ type: 'int', default: 0 })
  shortageLines: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  kitRate: number;

  @Column({ type: 'varchar', length: 20, default: 'ANALYZING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => KitsAnalysisLine, (line) => line.analysis)
  lines: KitsAnalysisLine[];
}

@Entity('kits_analysis_line')
export class KitsAnalysisLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  analysisId: string;

  @ManyToOne(() => KitsAnalysis, (analysis) => analysis.lines)
  @JoinColumn({ name: 'analysisId' })
  analysis: KitsAnalysis;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  requiredQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  shortageQuantity: number;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  kitStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventories)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'varchar', length: 50, nullable: true })
  batchNo: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  unitCost: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('material_lock')
export class MaterialLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  lockNo: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  lockType: string;

  @Column({ type: 'uuid', nullable: true })
  sourceId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sourceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lockedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lockedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'LOCKED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('material_substitute')
export class MaterialSubstitute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  originalMaterialId: string;

  @Column({ type: 'uuid' })
  substituteMaterialId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 1 })
  substitutionRatio: number;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('purchase_plan')
export class PurchasePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  planNo: string;

  @Column({ type: 'uuid' })
  materialId: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  requiredDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedOrderDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export const ApsEntities = [
  CalendarPlan,
  Material,
  BOM,
  Customer,
  Warehouse,
  Resource,
  Operation,
  SalesOrder,
  OrderSplit,
  OrderChange,
  ReplenishmentOrder,
  EngineeringPlan,
  EngineeringDocument,
  EngineeringLock,
  SchedulingPlan,
  SchedulingResult,
  BottleneckAnalysis,
  OrderInsertion,
  WorkOrder,
  WorkOrderSplit,
  MaterialRequirement,
  MrpRun,
  NetRequirement,
  ForecastConsumption,
  KitsAnalysis,
  KitsAnalysisLine,
  Inventory,
  MaterialLock,
  MaterialSubstitute,
  PurchasePlan,
];

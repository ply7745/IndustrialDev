import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  SalesOrder,
  WorkOrder,
  Resource,
  Operation,
  SchedulingPlan,
  SchedulingResult,
  BottleneckAnalysis,
  OrderInsertion,
  CalendarPlan,
} from './entities/aps.entities';

interface SchedulingParameters {
  horizonStart: Date;
  horizonEnd: Date;
  algorithm: 'FORWARD' | 'BACKWARD' | 'FINITE_CAPACITY';
  optimizationTarget: 'MIN_MAKESPAN' | 'MIN_DELAY' | 'BALANCE_LOAD';
  priorityOrders?: string[];
}

interface ScheduledTask {
  orderId: string;
  operationId: string;
  resourceId: string;
  startTime: Date;
  endTime: Date;
  quantity: number;
  priority: number;
}

@Injectable()
export class SchedulingEngineService {
  private readonly logger = new Logger(SchedulingEngineService.name);

  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Operation)
    private operationRepository: Repository<Operation>,
    @InjectRepository(SchedulingPlan)
    private schedulingPlanRepository: Repository<SchedulingPlan>,
    @InjectRepository(SchedulingResult)
    private schedulingResultRepository: Repository<SchedulingResult>,
    @InjectRepository(BottleneckAnalysis)
    private bottleneckAnalysisRepository: Repository<BottleneckAnalysis>,
    @InjectRepository(OrderInsertion)
    private orderInsertionRepository: Repository<OrderInsertion>,
    @InjectRepository(CalendarPlan)
    private calendarPlanRepository: Repository<CalendarPlan>,
  ) {}

  async createSchedulingPlan(
    name: string,
    parameters: SchedulingParameters,
  ): Promise<SchedulingPlan> {
    const planNo = `SCH-${Date.now()}`;
    const plan = this.schedulingPlanRepository.create({
      planNo,
      name,
      planningHorizonStart: parameters.horizonStart,
      planningHorizonEnd: parameters.horizonEnd,
      algorithm: parameters.algorithm,
      optimizationTarget: parameters.optimizationTarget,
      status: 'DRAFT',
    });

    return this.schedulingPlanRepository.save(plan);
  }

  async executeScheduling(planId: string): Promise<SchedulingResult[]> {
    this.logger.log(`Starting scheduling execution for plan ${planId}`);

    const plan = await this.schedulingPlanRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error(`Scheduling plan ${planId} not found`);
    }

    plan.status = 'RUNNING';
    await this.schedulingPlanRepository.save(plan);

    try {
      const parameters: SchedulingParameters = {
        horizonStart: plan.planningHorizonStart,
        horizonEnd: plan.planningHorizonEnd,
        algorithm: plan.algorithm as any,
        optimizationTarget: plan.optimizationTarget as any,
      };

      let results: SchedulingResult[];

      switch (parameters.algorithm) {
        case 'FORWARD':
          results = await this.forwardScheduling(planId, parameters);
          break;
        case 'BACKWARD':
          results = await this.backwardScheduling(planId, parameters);
          break;
        case 'FINITE_CAPACITY':
          results = await this.finiteCapacityScheduling(planId, parameters);
          break;
        default:
          results = await this.forwardScheduling(planId, parameters);
      }

      plan.status = 'COMPLETED';
      await this.schedulingPlanRepository.save(plan);

      this.logger.log(
        `Scheduling completed. Generated ${results.length} scheduled tasks.`,
      );
      return results;
    } catch (error) {
      this.logger.error(
        `Scheduling failed: ${error.message}`,
        error.stack,
      );
      plan.status = 'FAILED';
      await this.schedulingPlanRepository.save(plan);
      throw error;
    }
  }

  private async forwardScheduling(
    planId: string,
    parameters: SchedulingParameters,
  ): Promise<SchedulingResult[]> {
    const orders = await this.getOrdersForScheduling(parameters);
    const resources = await this.resourceRepository.find({
      where: { status: 'ACTIVE', type: 'WORKCENTER' },
    });

    const results: SchedulingResult[] = [];
    let currentTime = parameters.horizonStart;

    for (const order of orders) {
      const operations = await this.operationRepository.find({
        where: { workcenterId: null },
        order: { priority: 'ASC' },
      });

      for (const operation of operations) {
        const resource = resources.find(
          (r) => r.id === operation.workcenterId,
        ) || resources[0];

        if (!resource) continue;

        const processingTime = this.calculateProcessingTime(
          operation,
          order.quantity,
          resource,
        );

        const startTime = await this.findAvailableTimeSlot(
          resource.id,
          currentTime,
          processingTime,
        );

        const endTime = new Date(
          startTime.getTime() + processingTime * 60 * 60 * 1000,
        );

        const schedulingResult = await this.createSchedulingResult(
          planId,
          order,
          operation,
          resource,
          startTime,
          endTime,
          Number(order.quantity),
          order.priority,
        );

        results.push(schedulingResult);
        currentTime = endTime;
      }
    }

    return results;
  }

  private async backwardScheduling(
    planId: string,
    parameters: SchedulingParameters,
  ): Promise<SchedulingResult[]> {
    const orders = await this.getOrdersForScheduling(parameters);
    const resources = await this.resourceRepository.find({
      where: { status: 'ACTIVE', type: 'WORKCENTER' },
    });

    const results: SchedulingResult[] = [];

    for (const order of orders) {
      let currentTime = order.demandDate || parameters.horizonEnd;

      const operations = await this.operationRepository.find({
        where: { workcenterId: null },
        order: { priority: 'DESC' },
      });

      for (const operation of operations) {
        const resource = resources.find(
          (r) => r.id === operation.workcenterId,
        ) || resources[0];

        if (!resource) continue;

        const processingTime = this.calculateProcessingTime(
          operation,
          order.quantity,
          resource,
        );

        const endTime = currentTime;
        const startTime = new Date(
          endTime.getTime() - processingTime * 60 * 60 * 1000,
        );

        const schedulingResult = await this.createSchedulingResult(
          planId,
          order,
          operation,
          resource,
          startTime,
          endTime,
          Number(order.quantity),
          order.priority,
        );

        results.push(schedulingResult);
        currentTime = startTime;
      }
    }

    return results;
  }

  private async finiteCapacityScheduling(
    planId: string,
    parameters: SchedulingParameters,
  ): Promise<SchedulingResult[]> {
    const orders = await this.getOrdersForScheduling(parameters);
    const resources = await this.resourceRepository.find({
      where: { status: 'ACTIVE', type: 'WORKCENTER' },
    });

    const bottlenecks = await this.identifyBottleneckResources(resources);
    const results: SchedulingResult[] = [];

    for (const order of orders) {
      for (const bottleneck of bottlenecks) {
        const operations = await this.operationRepository.find({
          where: { workcenterId: bottleneck.id },
        });

        for (const operation of operations) {
          const capacity = await this.getResourceCapacity(
            bottleneck.id,
            parameters.horizonEnd,
          );
          const demand = Number(order.quantity);

          if (demand > capacity) {
            this.logger.warn(
              `Capacity conflict for order ${order.orderNo} at resource ${bottleneck.code}`,
            );
          }

          const processingTime = this.calculateProcessingTime(
            operation,
            order.quantity,
            bottleneck,
          );

          const startTime = await this.findAvailableTimeSlot(
            bottleneck.id,
            parameters.horizonStart,
            processingTime,
          );

          const endTime = new Date(
            startTime.getTime() + processingTime * 60 * 60 * 1000,
          );

          const schedulingResult = await this.createSchedulingResult(
            planId,
            order,
            operation,
            bottleneck,
            startTime,
            endTime,
            Number(order.quantity),
            order.priority,
          );

          results.push(schedulingResult);
        }
      }

      const nonBottleneckResources = resources.filter(
        (r) => !bottlenecks.find((b) => b.id === r.id),
      );

      for (const resource of nonBottleneckResources) {
        const operations = await this.operationRepository.find({
          where: { workcenterId: resource.id },
        });

        for (const operation of operations) {
          const processingTime = this.calculateProcessingTime(
            operation,
            order.quantity,
            resource,
          );

          const startTime = await this.findAvailableTimeSlot(
            resource.id,
            parameters.horizonStart,
            processingTime,
          );

          const endTime = new Date(
            startTime.getTime() + processingTime * 60 * 60 * 1000,
          );

          const schedulingResult = await this.createSchedulingResult(
            planId,
            order,
            operation,
            resource,
            startTime,
            endTime,
            Number(order.quantity),
            order.priority,
          );

          results.push(schedulingResult);
        }
      }
    }

    return results;
  }

  private async getOrdersForScheduling(
    parameters: SchedulingParameters,
  ): Promise<SalesOrder[]> {
    const queryBuilder = this.salesOrderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'APPROVED' })
      .andWhere('order.approvalStatus = :approvalStatus', {
        approvalStatus: 'APPROVED',
      })
      .andWhere('order.demandDate >= :start', {
        start: parameters.horizonStart,
      })
      .andWhere('order.demandDate <= :end', {
        end: parameters.horizonEnd,
      })
      .orderBy('order.priority', 'ASC')
      .addOrderBy('order.demandDate', 'ASC');

    if (parameters.priorityOrders && parameters.priorityOrders.length > 0) {
      queryBuilder.andWhere('order.id IN (:...priorityOrders)', {
        priorityOrders: parameters.priorityOrders,
      });
    }

    return queryBuilder.getMany();
  }

  private calculateProcessingTime(
    operation: Operation,
    quantity: number,
    resource: Resource,
  ): number {
    const setupTime = Number(operation.setupTime) || 0;
    const processTime = Number(operation.processTime) || 1;
    const queueTime = Number(operation.queueTime) || 0;

    const totalProcessTime =
      setupTime +
      processTime * quantity +
      queueTime * (quantity > 1 ? quantity - 1 : 0);

    const efficiency = Number(resource.efficiency) || 1;
    return totalProcessTime / efficiency;
  }

  private async findAvailableTimeSlot(
    resourceId: string,
    earliestStart: Date,
    duration: number,
  ): Promise<Date> {
    const existingSchedules = await this.schedulingResultRepository.find({
      where: {
        resourceId,
        plannedStartTime: LessThanOrEqual(earliestStart),
      },
      order: { plannedEndTime: 'DESC' },
      take: 1,
    });

    if (existingSchedules.length > 0) {
      const lastEnd = existingSchedules[0].plannedEndTime;
      const buffer = 0;
      return new Date(lastEnd.getTime() + buffer * 60 * 60 * 1000);
    }

    return earliestStart;
  }

  private async getResourceCapacity(
    resourceId: string,
    date: Date,
  ): Promise<number> {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });

    if (!resource) return 0;

    const calendar = await this.calendarPlanRepository.findOne({
      where: { id: resource.calendarId },
    });

    const workingHoursPerDay = calendar ? 8 : 8;
    const daysInMonth = 30;

    return workingHoursPerDay * daysInMonth * Number(resource.capacity);
  }

  private async identifyBottleneckResources(
    resources: Resource[],
  ): Promise<Resource[]> {
    const bottlenecks: Resource[] = [];

    for (const resource of resources) {
      const utilization = await this.calculateResourceUtilization(
        resource.id,
        new Date(),
      );

      if (utilization > 0.85) {
        bottlenecks.push(resource);
      }
    }

    return bottlenecks.length > 0 ? bottlenecks : [resources[0]];
  }

  private async calculateResourceUtilization(
    resourceId: string,
    date: Date,
  ): Promise<number> {
    const scheduledHours = await this.schedulingResultRepository
      .createQueryBuilder('result')
      .select('SUM(EXTRACT(EPOCH FROM (result.plannedEndTime - result.plannedStartTime)) / 3600)', 'totalHours')
      .where('result.resourceId = :resourceId', { resourceId })
      .andWhere('DATE(result.plannedStartTime) = :date', { date: date.toISOString().split('T')[0] })
      .getRawOne();

    const totalHours = scheduledHours?.totalHours || 0;
    const availableHours = 8;

    return availableHours > 0 ? Number(totalHours) / availableHours : 0;
  }

  private async createSchedulingResult(
    planId: string,
    order: SalesOrder,
    operation: Operation,
    resource: Resource,
    startTime: Date,
    endTime: Date,
    quantity: number,
    priority: number,
  ): Promise<SchedulingResult> {
    const schedulingResult = this.schedulingResultRepository.create({
      planId,
      orderId: order.id,
      operationId: operation.id,
      resourceId: resource.id,
      plannedStartTime: startTime,
      plannedEndTime: endTime,
      plannedQuantity: quantity,
      status: 'PLANNED',
      priority,
    });

    return this.schedulingResultRepository.save(schedulingResult);
  }

  async analyzeBottlenecks(date: Date): Promise<BottleneckAnalysis[]> {
    const resources = await this.resourceRepository.find({
      where: { status: 'ACTIVE', type: 'WORKCENTER' },
    });

    const results: BottleneckAnalysis[] = [];

    for (const resource of resources) {
      const utilization = await this.calculateResourceUtilization(
        resource.id,
        date,
      );

      const queueLength = await this.schedulingResultRepository.count({
        where: {
          resourceId: resource.id,
          status: 'QUEUED',
        },
      });

      const avgWaitTime = await this.calculateAverageWaitTime(resource.id);

      const isBottleneck = utilization > 0.85 || queueLength > 10;

      const analysis = this.bottleneckAnalysisRepository.create({
        workcenterId: resource.id,
        analysisDate: date,
        utilizationRate: utilization,
        queueLength,
        avgWaitTime,
        isBottleneck,
        recommendations: isBottleneck
          ? `建议增加产能或优化生产计划。当前利用率${(utilization * 100).toFixed(1)}%。`
          : null,
      });

      results.push(await this.bottleneckAnalysisRepository.save(analysis));
    }

    return results;
  }

  private async calculateAverageWaitTime(resourceId: string): Promise<number> {
    const results = await this.schedulingResultRepository.find({
      where: { resourceId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (results.length === 0) return 0;

    let totalWaitTime = 0;
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i];
      const previous = results[i + 1];
      const waitTime =
        current.plannedStartTime.getTime() -
        previous.plannedEndTime.getTime();
      totalWaitTime += waitTime;
    }

    return (totalWaitTime / (results.length - 1)) / (60 * 60 * 1000);
  }

  async urgentInsertion(
    orderId: string,
    reason: string,
  ): Promise<OrderInsertion> {
    const order = await this.salesOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const originalDemandDate = order.demandDate;

    order.priority = 1;
    order.demandDate = new Date();
    await this.salesOrderRepository.save(order);

    const insertion = this.orderInsertionRepository.create({
      orderId,
      insertionType: 'URGENT',
      originalDemandDate,
      newDemandDate: order.demandDate,
      reason,
      impactedOrders: [],
      status: 'APPROVED',
    });

    return this.orderInsertionRepository.save(insertion);
  }

  async forceInsertion(
    orderId: string,
    newDemandDate: Date,
    reason: string,
  ): Promise<OrderInsertion> {
    const order = await this.salesOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const originalDemandDate = order.demandDate;
    order.demandDate = newDemandDate;
    await this.salesOrderRepository.save(order);

    const impactedOrders = await this.getImpactedOrders(orderId, newDemandDate);

    const insertion = this.orderInsertionRepository.create({
      orderId,
      insertionType: 'FORCE',
      originalDemandDate,
      newDemandDate,
      reason,
      impactedOrders,
      status: 'PENDING',
    });

    return this.orderInsertionRepository.save(insertion);
  }

  private async getImpactedOrders(
    insertedOrderId: string,
    newDemandDate: Date,
  ): Promise<object[]> {
    const impactedOrders = await this.salesOrderRepository
      .createQueryBuilder('order')
      .where('order.demandDate < :newDemandDate', { newDemandDate })
      .andWhere('order.id != :insertedOrderId', { insertedOrderId })
      .andWhere('order.status = :status', { status: 'APPROVED' })
      .orderBy('order.demandDate', 'ASC')
      .take(10)
      .getMany();

    return impactedOrders.map((order) => ({
      orderId: order.id,
      orderNo: order.orderNo,
      originalDemandDate: order.demandDate,
    }));
  }

  async getSchedulingResults(planId: string): Promise<SchedulingResult[]> {
    return this.schedulingResultRepository.find({
      where: { planId },
      relations: ['order', 'operation', 'resource'],
      order: { plannedStartTime: 'ASC' },
    });
  }
}

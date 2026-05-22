import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  Material,
  BOM,
  SalesOrder,
  ReplenishmentOrder,
  Inventory,
  MrpRun,
  NetRequirement,
  MaterialRequirement,
} from './entities/aps.entities';

interface MrpParameters {
  horizonStart: Date;
  horizonEnd: Date;
  includeSalesOrders: boolean;
  includeForecasts: boolean;
  includeWorkOrders: boolean;
}

interface MaterialDemand {
  materialId: string;
  materialCode: string;
  materialName: string;
  grossRequirement: number;
  scheduledReceipts: number;
  onHandQuantity: number;
  safetyStock: number;
  netRequirement: number;
  availableQuantity: number;
  orderSuggestion: number;
  requiredDate: Date;
}

@Injectable()
export class MrpEngineService {
  private readonly logger = new Logger(MrpEngineService.name);

  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(ReplenishmentOrder)
    private replenishmentOrderRepository: Repository<ReplenishmentOrder>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(MrpRun)
    private mrpRunRepository: Repository<MrpRun>,
    @InjectRepository(NetRequirement)
    private netRequirementRepository: Repository<NetRequirement>,
    @InjectRepository(MaterialRequirement)
    private materialRequirementRepository: Repository<MaterialRequirement>,
  ) {}

  async runMrp(parameters: MrpParameters): Promise<MrpRun> {
    this.logger.log('Starting MRP run...');

    const mrpRun = await this.createMrpRun(parameters);

    try {
      const materials = await this.getMaterialsSortedByBomLevel();
      const demands: MaterialDemand[] = [];

      for (const material of materials) {
        const materialDemand = await this.calculateMaterialDemand(
          material,
          parameters,
        );
        demands.push(materialDemand);

        await this.saveNetRequirement(mrpRun.id, materialDemand);
      }

      await this.updateMrpRunStats(mrpRun.id, demands);

      mrpRun.status = 'COMPLETED';
      mrpRun.endTime = new Date();
      await this.mrpRunRepository.save(mrpRun);

      this.logger.log(`MRP run completed. Processed ${materials.length} materials.`);
      return mrpRun;
    } catch (error) {
      this.logger.error(`MRP run failed: ${error.message}`, error.stack);
      mrpRun.status = 'FAILED';
      mrpRun.endTime = new Date();
      await this.mrpRunRepository.save(mrpRun);
      throw error;
    }
  }

  private async createMrpRun(parameters: MrpParameters): Promise<MrpRun> {
    const runNo = `MRP-${Date.now()}`;
    const mrpRun = this.mrpRunRepository.create({
      runNo,
      planningHorizonStart: parameters.horizonStart,
      planningHorizonEnd: parameters.horizonEnd,
      startTime: new Date(),
      status: 'RUNNING',
    });
    return this.mrpRunRepository.save(mrpRun);
  }

  private async getMaterialsSortedByBomLevel(): Promise<Material[]> {
    return this.materialRepository.find({
      where: { status: 'ACTIVE' },
      order: { bomLevel: 'ASC' },
    });
  }

  private async calculateMaterialDemand(
    material: Material,
    parameters: MrpParameters,
  ): Promise<MaterialDemand> {
    const grossRequirement = await this.calculateGrossRequirement(
      material,
      parameters,
    );

    const scheduledReceipts = await this.getScheduledReceipts(
      material.id,
      parameters.horizonStart,
      parameters.horizonEnd,
    );

    const onHandQuantity = await this.getOnHandQuantity(material.id);
    const safetyStock = material.safetyStock || 0;

    const availableQuantity = onHandQuantity + scheduledReceipts - safetyStock;
    const netRequirement = Math.max(0, grossRequirement - availableQuantity);

    const orderSuggestion = this.calculateOrderSuggestion(
      material,
      netRequirement,
    );

    const requiredDate = this.calculateRequiredDate(
      material.leadTime,
      parameters.horizonEnd,
    );

    return {
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      grossRequirement,
      scheduledReceipts,
      onHandQuantity,
      safetyStock,
      netRequirement,
      availableQuantity,
      orderSuggestion,
      requiredDate,
    };
  }

  private async calculateGrossRequirement(
    material: Material,
    parameters: MrpParameters,
  ): Promise<number> {
    let totalRequirement = 0;

    if (parameters.includeSalesOrders) {
      const orders = await this.salesOrderRepository.find({
        where: {
          materialId: material.id,
          status: In(['APPROVED', 'IN_PROGRESS']),
          demandDate: Between(parameters.horizonStart, parameters.horizonEnd),
        },
      });

      for (const order of orders) {
        totalRequirement += Number(order.quantity);

        const childBomRequirements = await this.calculateChildBomRequirements(
          material.id,
          order.quantity,
          1,
        );
        totalRequirement += childBomRequirements;
      }
    }

    if (parameters.includeForecasts) {
      const forecasts = await this.salesOrderRepository.find({
        where: {
          orderType: 'FORECAST',
          status: 'APPROVED',
          demandDate: Between(parameters.horizonStart, parameters.horizonEnd),
        },
      });

      for (const forecast of forecasts) {
        totalRequirement += Number(forecast.quantity);
      }
    }

    return totalRequirement;
  }

  private async calculateChildBomRequirements(
    parentMaterialId: string,
    parentQuantity: number,
    level: number,
  ): Promise<number> {
    if (level > 10) return 0;

    const boms = await this.bomRepository.find({
      where: {
        parentMaterialId,
        isAlternative: false,
        effectiveDate: Between(new Date('2000-01-01'), new Date()),
      },
      relations: ['childMaterial'],
    });

    let totalRequirement = 0;

    for (const bom of boms) {
      const requiredQuantity =
        parentQuantity * Number(bom.quantity) * (1 + Number(bom.scrapRate));
      totalRequirement += requiredQuantity;

      totalRequirement += await this.calculateChildBomRequirements(
        bom.childMaterialId,
        requiredQuantity,
        level + 1,
      );
    }

    return totalRequirement;
  }

  private async getScheduledReceipts(
    materialId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const purchasePlans = await this.materialRequirementRepository.find({
      where: {
        materialId,
        sourceType: 'PURCHASE',
        status: In(['APPROVED', 'RECEIVED']),
        requiredDate: Between(startDate, endDate),
      },
    });

    return purchasePlans.reduce(
      (sum, plan) => sum + Number(plan.requiredQuantity),
      0,
    );
  }

  private async getOnHandQuantity(materialId: string): Promise<number> {
    const inventories = await this.inventoryRepository.find({
      where: { materialId },
    });

    return inventories.reduce(
      (sum, inv) => sum + Number(inv.quantity) - Number(inv.reservedQuantity),
      0,
    );
  }

  private calculateOrderSuggestion(
    material: Material,
    netRequirement: number,
  ): number {
    if (netRequirement <= 0) return 0;

    const minLotSize = material.minLotSize || 1;
    const maxLotSize = material.maxLotSize;

    if (netRequirement <= minLotSize) {
      return minLotSize;
    }

    if (maxLotSize && netRequirement > maxLotSize) {
      return Math.ceil(netRequirement / maxLotSize) * maxLotSize;
    }

    return Math.ceil(netRequirement / minLotSize) * minLotSize;
  }

  private calculateRequiredDate(leadTime: number, horizonEnd: Date): Date {
    const requiredDate = new Date(horizonEnd);
    requiredDate.setDate(requiredDate.getDate() - (leadTime || 0));
    return requiredDate;
  }

  private async saveNetRequirement(
    mrpRunId: string,
    demand: MaterialDemand,
  ): Promise<void> {
    const netRequirement = this.netRequirementRepository.create({
      mrpRunId,
      materialId: demand.materialId,
      grossRequirement: demand.grossRequirement,
      scheduledReceipts: demand.scheduledReceipts,
      onHandQuantity: demand.onHandQuantity,
      safetyStock: demand.safetyStock,
      netRequirement: demand.netRequirement,
      availableQuantity: demand.availableQuantity,
      orderSuggestion: demand.orderSuggestion,
      requiredDate: demand.requiredDate,
      plannedOrderDate: demand.requiredDate,
      status: 'CALCULATED',
    });

    await this.netRequirementRepository.save(netRequirement);
  }

  private async updateMrpRunStats(
    mrpRunId: string,
    demands: MaterialDemand[],
  ): Promise<void> {
    const totalOrders = await this.salesOrderRepository.count({
      where: { status: In(['APPROVED', 'IN_PROGRESS']) },
    });

    const shortageCount = demands.filter((d) => d.shortageQuantity > 0).length;

    await this.mrpRunRepository.update(mrpRunId, {
      totalOrders,
      totalRequirements: demands.length,
      shortageCount,
    });
  }

  async getMrpRunResults(mrpRunId: string): Promise<NetRequirement[]> {
    return this.netRequirementRepository.find({
      where: { mrpRunId },
      relations: ['material'],
      order: { requiredDate: 'ASC' },
    });
  }

  async getMaterialRequirements(
    sourceType?: string,
  ): Promise<MaterialRequirement[]> {
    const where: any = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }

    return this.materialRequirementRepository.find({
      where,
      relations: ['material'],
      order: { requiredDate: 'ASC' },
    });
  }

  async generatePurchasePlan(mrpRunId: string): Promise<MaterialRequirement[]> {
    const netRequirements = await this.netRequirementRepository.find({
      where: { mrpRunId, status: 'CALCULATED' },
    });

    const purchaseRequirements: MaterialRequirement[] = [];

    for (const nr of netRequirements) {
      if (nr.orderSuggestion > 0) {
        const material = await this.materialRepository.findOne({
          where: { id: nr.materialId },
        });

        if (material && material.type === 'RAW') {
          const requirement = this.materialRequirementRepository.create({
            requirementNo: `PR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceType: 'PURCHASE',
            sourceId: mrpRunId,
            materialId: nr.materialId,
            requiredQuantity: nr.orderSuggestion,
            requiredDate: nr.requiredDate,
            priority: 5,
            status: 'PENDING',
          });

          purchaseRequirements.push(
            await this.materialRequirementRepository.save(requirement),
          );
        }
      }
    }

    return purchaseRequirements;
  }
}

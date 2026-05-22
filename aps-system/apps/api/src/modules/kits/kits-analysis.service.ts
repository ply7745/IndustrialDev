import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  KitsAnalysis,
  KitsAnalysisLine,
  SalesOrder,
  WorkOrder,
  Inventory,
  BOM,
  Material,
} from './entities/aps.entities';

interface KitsRequirement {
  materialId: string;
  materialCode: string;
  materialName: string;
  requiredQuantity: number;
}

@Injectable()
export class KitsAnalysisService {
  private readonly logger = new Logger(KitsAnalysisService.name);

  constructor(
    @InjectRepository(KitsAnalysis)
    private kitsAnalysisRepository: Repository<KitsAnalysis>,
    @InjectRepository(KitsAnalysisLine)
    private kitsAnalysisLineRepository: Repository<KitsAnalysisLine>,
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async analyzeOrderKits(orderId: string): Promise<KitsAnalysis> {
    const order = await this.salesOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return this.performKitsAnalysis('ORDER', orderId, order.demandDate);
  }

  async analyzeWorkOrderKits(workOrderId: string): Promise<KitsAnalysis> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new Error(`Work order ${workOrderId} not found`);
    }

    return this.performKitsAnalysis('WORK_ORDER', workOrderId, workOrder.plannedStartDate);
  }

  private async performKitsAnalysis(
    sourceType: string,
    sourceId: string,
    requiredDate: Date,
  ): Promise<KitsAnalysis> {
    this.logger.log(`Starting kits analysis for ${sourceType}: ${sourceId}`);

    const analysisNo = `KIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const analysis = this.kitsAnalysisRepository.create({
      analysisNo,
      sourceType,
      sourceId,
      analysisDate: new Date(),
      requiredDate,
      status: 'ANALYZING',
    });

    const savedAnalysis = await this.kitsAnalysisRepository.save(analysis);

    try {
      const requirements = await this.getMaterialRequirements(
        sourceType,
        sourceId,
      );

      let kitLines = 0;
      let shortageLines = 0;

      for (const req of requirements) {
        const available = await this.getAvailableQuantity(req.materialId);
        const shortage = Math.max(0, req.requiredQuantity - available);
        const kitStatus = shortage === 0 ? 'KITTED' : 'SHORTAGE';

        if (kitStatus === 'KITTED') {
          kitLines++;
        } else {
          shortageLines++;
        }

        const line = this.kitsAnalysisLineRepository.create({
          analysisId: savedAnalysis.id,
          materialId: req.materialId,
          requiredQuantity: req.requiredQuantity,
          availableQuantity: available,
          shortageQuantity: shortage,
          kitStatus,
        });

        await this.kitsAnalysisLineRepository.save(line);
      }

      const kitRate =
        requirements.length > 0 ? kitLines / requirements.length : 0;

      savedAnalysis.totalLines = requirements.length;
      savedAnalysis.kitLines = kitLines;
      savedAnalysis.shortageLines = shortageLines;
      savedAnalysis.kitRate = kitRate;
      savedAnalysis.status = 'COMPLETED';

      await this.kitsAnalysisRepository.save(savedAnalysis);

      this.logger.log(
        `Kits analysis completed. Total: ${requirements.length}, Kit lines: ${kitLines}, Shortage: ${shortageLines}`,
      );

      return savedAnalysis;
    } catch (error) {
      this.logger.error(`Kits analysis failed: ${error.message}`, error.stack);
      savedAnalysis.status = 'FAILED';
      await this.kitsAnalysisRepository.save(savedAnalysis);
      throw error;
    }
  }

  private async getMaterialRequirements(
    sourceType: string,
    sourceId: string,
  ): Promise<KitsRequirement[]> {
    const requirements: KitsRequirement[] = [];

    if (sourceType === 'ORDER') {
      const order = await this.salesOrderRepository.findOne({
        where: { id: sourceId },
      });

      if (!order || !order.materialId) {
        return requirements;
      }

      const bomRequirements = await this.getBomRequirements(
        order.materialId,
        Number(order.quantity),
      );

      requirements.push(...bomRequirements);
    } else if (sourceType === 'WORK_ORDER') {
      const workOrder = await this.workOrderRepository.findOne({
        where: { id: sourceId },
      });

      if (!workOrder) {
        return requirements;
      }

      const bomRequirements = await this.getBomRequirements(
        workOrder.materialId,
        Number(workOrder.quantity),
      );

      requirements.push(...bomRequirements);
    }

    return requirements;
  }

  private async getBomRequirements(
    materialId: string,
    quantity: number,
  ): Promise<KitsRequirement[]> {
    const requirements: KitsRequirement[] = [];

    const boms = await this.bomRepository.find({
      where: {
        parentMaterialId: materialId,
        isAlternative: false,
      },
      relations: ['childMaterial'],
    });

    for (const bom of boms) {
      const requiredQty =
        quantity * Number(bom.quantity) * (1 + Number(bom.scrapRate));

      requirements.push({
        materialId: bom.childMaterialId,
        materialCode: bom.childMaterial.code,
        materialName: bom.childMaterial.name,
        requiredQuantity: requiredQty,
      });

      if (bom.childMaterial.type !== 'RAW') {
        const childRequirements = await this.getBomRequirements(
          bom.childMaterialId,
          requiredQty,
        );
        requirements.push(...childRequirements);
      }
    }

    return requirements;
  }

  private async getAvailableQuantity(materialId: string): Promise<number> {
    const inventories = await this.inventoryRepository.find({
      where: { materialId },
    });

    return inventories.reduce(
      (total, inv) =>
        total +
        Number(inv.quantity) -
        Number(inv.reservedQuantity),
      0,
    );
  }

  async getKitsAnalysis(analysisId: string): Promise<KitsAnalysis> {
    return this.kitsAnalysisRepository.findOne({
      where: { id: analysisId },
      relations: ['lines'],
    });
  }

  async getKitsAnalysisList(
    sourceType?: string,
  ): Promise<KitsAnalysis[]> {
    const where: any = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }

    return this.kitsAnalysisRepository.find({
      where,
      order: { analysisDate: 'DESC' },
      take: 100,
    });
  }

  async getShortageMaterials(analysisId: string): Promise<KitsAnalysisLine[]> {
    return this.kitsAnalysisLineRepository.find({
      where: {
        analysisId,
        kitStatus: 'SHORTAGE',
      },
    });
  }

  async getSubstituteRecommendations(
    materialId: string,
  ): Promise<Material[]> {
    const material = await this.materialRepository.findOne({
      where: { id: materialId },
    });

    if (!material) {
      return [];
    }

    return this.materialRepository.find({
      where: {
        type: material.type,
        status: 'ACTIVE',
      },
      take: 5,
    });
  }
}

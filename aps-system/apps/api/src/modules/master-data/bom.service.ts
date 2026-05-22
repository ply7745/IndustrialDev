import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { BOM } from '../../../../../packages/database/src/entities/aps.entities';

export interface CreateBomDto {
  parentMaterialId: string;
  childMaterialId: string;
  quantity: number;
  scrapRate?: number;
  version?: string;
  effectiveDate: Date;
  expiryDate?: Date;
  isAlternative?: boolean;
  priority?: number;
}

export interface UpdateBomDto {
  quantity?: number;
  scrapRate?: number;
  version?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  isAlternative?: boolean;
  priority?: number;
}

export interface BomQueryDto {
  parentMaterialId?: string;
  childMaterialId?: string;
  isAlternative?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
  ) {}

  async create(dto: CreateBomDto): Promise<BOM> {
    const existing = await this.bomRepository.findOne({
      where: {
        parentMaterialId: dto.parentMaterialId,
        childMaterialId: dto.childMaterialId,
        version: dto.version || null,
      },
    });

    if (existing) {
      throw new ConflictException('该BOM关系已存在');
    }

    const bom = this.bomRepository.create({
      ...dto,
      isAlternative: dto.isAlternative || false,
      priority: dto.priority || 1,
    });

    return this.bomRepository.save(bom);
  }

  async findAll(query: BomQueryDto): Promise<{ list: BOM[]; total: number }> {
    const where: any = {};

    if (query.parentMaterialId) {
      where.parentMaterialId = query.parentMaterialId;
    }
    if (query.childMaterialId) {
      where.childMaterialId = query.childMaterialId;
    }
    if (query.isAlternative !== undefined) {
      where.isAlternative = query.isAlternative;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.bomRepository.findAndCount({
      where,
      relations: ['parentMaterial', 'childMaterial'],
      order: { parentMaterialId: 'ASC', priority: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<BOM> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['parentMaterial', 'childMaterial'],
    });

    if (!bom) {
      throw new NotFoundException(`BOM ${id} 不存在`);
    }

    return bom;
  }

  async update(id: string, dto: UpdateBomDto): Promise<BOM> {
    const bom = await this.findOne(id);

    Object.assign(bom, dto);

    return this.bomRepository.save(bom);
  }

  async remove(id: string): Promise<void> {
    const bom = await this.findOne(id);
    await this.bomRepository.remove(bom);
  }

  async findByParent(parentMaterialId: string): Promise<BOM[]> {
    return this.bomRepository.find({
      where: { parentMaterialId },
      relations: ['childMaterial'],
      order: { priority: 'ASC' },
    });
  }

  async findByChild(childMaterialId: string): Promise<BOM[]> {
    return this.bomRepository.find({
      where: { childMaterialId },
      relations: ['parentMaterial'],
      order: { priority: 'ASC' },
    });
  }

  async getEffectiveBom(parentMaterialId: string, date?: Date): Promise<BOM[]> {
    const queryDate = date || new Date();

    return this.bomRepository.find({
      where: {
        parentMaterialId,
        effectiveDate: LessThanOrEqual(queryDate),
      },
      relations: ['childMaterial'],
      order: { priority: 'ASC' },
    });
  }

  async expandBom(
    parentMaterialId: string,
    quantity: number,
    level = 0,
    maxLevel = 10,
  ): Promise<any[]> {
    if (level >= maxLevel) {
      return [];
    }

    const boms = await this.getEffectiveBom(parentMaterialId);

    const results = [];

    for (const bom of boms) {
      const requiredQuantity = quantity * bom.quantity * (1 + (bom.scrapRate || 0));

      const item = {
        level,
        bomId: bom.id,
        parentMaterialId: bom.parentMaterialId,
        childMaterialId: bom.childMaterialId,
        childMaterialCode: bom.childMaterial.code,
        childMaterialName: bom.childMaterial.name,
        childMaterialType: bom.childMaterial.type,
        quantity: bom.quantity,
        scrapRate: bom.scrapRate,
        requiredQuantity,
      };

      results.push(item);

      if (bom.childMaterial.type !== 'RAW') {
        const childItems = await this.expandBom(
          bom.childMaterialId,
          requiredQuantity,
          level + 1,
          maxLevel,
        );
        results.push(...childItems);
      }
    }

    return results;
  }

  async getMaterialBoms(materialId: string): Promise<any> {
    const parentBoms = await this.bomRepository.find({
      where: { parentMaterialId: materialId },
      relations: ['childMaterial'],
      order: { priority: 'ASC' },
    });

    const childBoms = await this.bomRepository.find({
      where: { childMaterialId: materialId },
      relations: ['parentMaterial'],
      order: { priority: 'ASC' },
    });

    return {
      materialId,
      parentBoms,
      childBoms,
    };
  }

  async copyBom(sourceParentId: string, targetParentId: string): Promise<BOM[]> {
    const sourceBoms = await this.findByParent(sourceParentId);

    const copiedBoms: BOM[] = [];

    for (const bom of sourceBoms) {
      const newBom = await this.create({
        parentMaterialId: targetParentId,
        childMaterialId: bom.childMaterialId,
        quantity: bom.quantity,
        scrapRate: bom.scrapRate,
        version: bom.version,
        effectiveDate: bom.effectiveDate,
        isAlternative: bom.isAlternative,
        priority: bom.priority,
      });

      copiedBoms.push(newBom);
    }

    return copiedBoms;
  }
}

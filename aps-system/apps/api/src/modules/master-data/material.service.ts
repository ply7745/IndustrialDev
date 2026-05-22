import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Material, BOM } from '../../../../../packages/database/src/entities/aps.entities';

export interface CreateMaterialDto {
  code: string;
  name: string;
  type: string;
  unit: string;
  unitCost?: number;
  safetyStock?: number;
  minLotSize?: number;
  maxLotSize?: number;
  leadTime?: number;
  warehouseId?: string;
}

export interface UpdateMaterialDto {
  name?: string;
  type?: string;
  unit?: string;
  unitCost?: number;
  safetyStock?: number;
  minLotSize?: number;
  maxLotSize?: number;
  leadTime?: number;
  status?: string;
}

export interface MaterialQueryDto {
  code?: string;
  name?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<Material> {
    const existing = await this.materialRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`物料编码 ${dto.code} 已存在`);
    }

    const material = this.materialRepository.create({
      ...dto,
      status: 'ACTIVE',
    });

    return this.materialRepository.save(material);
  }

  async findAll(query: MaterialQueryDto): Promise<{ list: Material[]; total: number }> {
    const where: any = {};

    if (query.code) {
      where.code = Like(`%${query.code}%`);
    }
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.materialRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`物料 ${id} 不存在`);
    }

    return material;
  }

  async findByCode(code: string): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { code },
    });

    if (!material) {
      throw new NotFoundException(`物料编码 ${code} 不存在`);
    }

    return material;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);

    Object.assign(material, dto);

    return this.materialRepository.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.findOne(id);

    material.status = 'INACTIVE';
    await this.materialRepository.save(material);
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    return this.materialRepository.find({
      where: { id: In(ids) },
    });
  }

  async findByType(type: string): Promise<Material[]> {
    return this.materialRepository.find({
      where: { type, status: 'ACTIVE' },
      order: { code: 'ASC' },
    });
  }

  async getBomTree(materialId: string, level = 0, maxLevel = 10): Promise<any> {
    if (level >= maxLevel) {
      return null;
    }

    const material = await this.findOne(materialId);

    const boms = await this.bomRepository.find({
      where: {
        parentMaterialId: materialId,
        isAlternative: false,
      },
      relations: ['childMaterial'],
      order: { priority: 'ASC' },
    });

    const children = [];

    for (const bom of boms) {
      const child = await this.getBomTree(bom.childMaterialId, level + 1, maxLevel);

      children.push({
        bomId: bom.id,
        materialId: bom.childMaterialId,
        materialCode: bom.childMaterial.code,
        materialName: bom.childMaterial.name,
        materialType: bom.childMaterial.type,
        quantity: bom.quantity,
        scrapRate: bom.scrapRate,
        children: child ? child.children : [],
      });
    }

    return {
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      materialType: material.type,
      children,
    };
  }

  async calculateBomLevel(materialId: string): Promise<number> {
    const boms = await this.bomRepository.find({
      where: { parentMaterialId: materialId },
    });

    if (boms.length === 0) {
      return 0;
    }

    let maxChildLevel = 0;

    for (const bom of boms) {
      const childLevel = await this.calculateBomLevel(bom.childMaterialId);
      maxChildLevel = Math.max(maxChildLevel, childLevel);
    }

    return maxChildLevel + 1;
  }

  async batchImport(materials: CreateMaterialDto[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const dto of materials) {
      try {
        await this.create(dto);
        success++;
      } catch (error) {
        failed++;
        errors.push(`${dto.code}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }
}

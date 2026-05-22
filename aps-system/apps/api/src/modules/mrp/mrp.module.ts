import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { MrpController } from './mrp.controller';
import { MaterialRequirementController } from './material-requirement.controller';
import { PurchasePlanController } from './purchase-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [MrpController, MaterialRequirementController, PurchasePlanController],
  providers: [],
  exports: [],
})
export class MrpModule {}

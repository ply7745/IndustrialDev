import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { SchedulingController } from './scheduling.controller';
import { WorkOrderController } from './work-order.controller';
import { KitsController } from './kits.controller';
import { MaterialController } from './material.controller';
import { EngineeringController } from './engineering.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [
    SchedulingController,
    WorkOrderController,
    KitsController,
    MaterialController,
    EngineeringController,
  ],
  providers: [],
  exports: [],
})
export class SchedulingModule {}

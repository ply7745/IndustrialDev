import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { WorkOrderController } from './work-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [WorkOrderController],
  providers: [],
  exports: [],
})
export class WorkOrderModule {}

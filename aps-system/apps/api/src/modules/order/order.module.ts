import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ReplenishmentOrderService } from './replenishment-order.service';
import { ReplenishmentOrderController } from './replenishment-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [OrderController, ReplenishmentOrderController],
  providers: [OrderService, ReplenishmentOrderService],
  exports: [OrderService, ReplenishmentOrderService],
})
export class OrderModule {}

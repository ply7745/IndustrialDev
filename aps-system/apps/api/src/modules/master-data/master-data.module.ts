import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [
    MaterialController,
    BomController,
    CustomerController,
    WarehouseController,
    ResourceController,
    CalendarController,
    OperationController,
  ],
  providers: [
    MaterialService,
    BomService,
    CustomerService,
    WarehouseService,
    ResourceService,
    CalendarService,
    OperationService,
  ],
  exports: [
    MaterialService,
    BomService,
    CustomerService,
    WarehouseService,
    ResourceService,
    CalendarService,
    OperationService,
  ],
})
export class MasterDataModule {}

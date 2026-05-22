import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ApsEntities } from '../../../packages/database/src/entities/aps.entities';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { OrderModule } from './modules/order/order.module';
import { MrpModule } from './modules/mrp/mrp.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { KitsModule } from './modules/kits/kits.module';
import { MaterialModule } from './modules/material/material.module';
import { EngineeringModule } from './modules/engineering/engineering.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'aps_db',
      entities: ApsEntities,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    MasterDataModule,
    OrderModule,
    MrpModule,
    SchedulingModule,
    WorkOrderModule,
    KitsModule,
    MaterialModule,
    EngineeringModule,
  ],
})
export class AppModule {}

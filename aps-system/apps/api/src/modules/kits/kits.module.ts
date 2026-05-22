import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { KitsController } from './kits.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [KitsController],
  providers: [],
  exports: [],
})
export class KitsModule {}

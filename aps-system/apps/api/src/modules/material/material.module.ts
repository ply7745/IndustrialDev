import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { MaterialController } from './material.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [MaterialController],
  providers: [],
  exports: [],
})
export class MaterialModule {}

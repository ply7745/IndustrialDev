import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApsEntities } from '../../../../packages/database/src/entities/aps.entities';
import { EngineeringController } from './engineering.controller';

@Module({
  imports: [TypeOrmModule.forFeature(ApsEntities)],
  controllers: [EngineeringController],
  providers: [],
  exports: [],
})
export class EngineeringModule {}

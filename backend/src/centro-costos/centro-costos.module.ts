import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentroCostosController } from './centro-costos.controller';
import { CentroCostosService } from './centro-costos.service';
import { CentroCostos } from '../entities/centro-costos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CentroCostos])],
  controllers: [CentroCostosController],
  providers: [CentroCostosService],
  exports: [CentroCostosService],
})
export class CentroCostosModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosNominaController } from './periodos-nomina.controller';
import { PeriodosNominaService } from './periodos-nomina.service';
import { PeriodoNomina } from '../entities/periodo-nomina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoNomina])],
  controllers: [PeriodosNominaController],
  providers: [PeriodosNominaService],
  exports: [PeriodosNominaService],
})
export class PeriodosNominaModule { }

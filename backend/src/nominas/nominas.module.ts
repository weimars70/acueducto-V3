import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominasController } from './nominas.controller';
import { NominaCatalogsController } from './nomina-catalogs.controller';
import { NominasService } from './nominas.service';
import { Nomina } from '../entities/nomina.entity';
import { NominaDetalle } from '../entities/nomina-detalle.entity';
import { EmpleadosModule } from '../empleados/empleados.module';
import { PeriodosNominaModule } from '../periodos-nomina/periodos-nomina.module';
import { ConceptosNominaModule } from '../conceptos-nomina/conceptos-nomina.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nomina, NominaDetalle]),
    EmpleadosModule,
    PeriodosNominaModule,
    ConceptosNominaModule,
  ],
  controllers: [NominasController, NominaCatalogsController],
  providers: [NominasService],
  exports: [NominasService],
})
export class NominasModule { }

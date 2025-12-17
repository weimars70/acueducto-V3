import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptosNominaController } from './conceptos-nomina.controller';
import { ConceptosNominaService } from './conceptos-nomina.service';
import { ConceptoNomina } from '../entities/concepto-nomina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConceptoNomina])],
  controllers: [ConceptosNominaController],
  providers: [ConceptosNominaService],
  exports: [ConceptosNominaService],
})
export class ConceptosNominaModule { }

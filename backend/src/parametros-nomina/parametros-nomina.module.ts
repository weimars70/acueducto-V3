import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametrosNominaController } from './parametros-nomina.controller';
import { ParametrosNominaService } from './parametros-nomina.service';
import { ParametroNomina } from '../entities/parametro-nomina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParametroNomina])],
  controllers: [ParametrosNominaController],
  providers: [ParametrosNominaService],
  exports: [ParametrosNominaService],
})
export class ParametrosNominaModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasConceptosService } from './notas-conceptos.service';
import { NotasConceptosController } from './notas-conceptos.controller';
import { NotaConcepto } from '../entities/nota-concepto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotaConcepto])],
  controllers: [NotasConceptosController],
  providers: [NotasConceptosService],
})
export class NotasConceptosModule {}

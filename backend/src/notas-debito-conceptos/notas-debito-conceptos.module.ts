import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasDebitoConceptosService } from './notas-debito-conceptos.service';
import { NotasDebitoConceptosController } from './notas-debito-conceptos.controller';
import { NotaDebitoConcepto } from './entities/nota-debito-concepto.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotaDebitoConcepto])],
    controllers: [NotasDebitoConceptosController],
    providers: [NotasDebitoConceptosService],
    exports: [NotasDebitoConceptosService],
})
export class NotasDebitoConceptosModule { }

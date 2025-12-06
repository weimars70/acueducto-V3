import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptosFacturaService } from './conceptos-factura.service';
import { ConceptosFacturaController } from './conceptos-factura.controller';
import { ConceptoFactura } from '../entities/concepto-factura.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ConceptoFactura])],
    controllers: [ConceptosFacturaController],
    providers: [ConceptosFacturaService],
})
export class ConceptosFacturaModule { }

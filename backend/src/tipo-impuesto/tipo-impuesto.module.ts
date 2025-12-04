import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoImpuestoController } from './tipo-impuesto.controller';
import { TipoImpuestoService } from './tipo-impuesto.service';
import { TipoImpuesto } from '../entities/tipo-impuesto.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TipoImpuesto])],
    controllers: [TipoImpuestoController],
    providers: [TipoImpuestoService],
    exports: [TipoImpuestoService],
})
export class TipoImpuestoModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AjustesInventarioController } from './ajustes-inventario.controller';
import { AjustesInventarioService } from './ajustes-inventario.service';
import { AjusteInventario } from '../entities/ajuste-inventario.entity';
import { TiposAjusteInventarioModule } from '../tipos-ajuste-inventario/tipos-ajuste-inventario.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AjusteInventario]),
        TiposAjusteInventarioModule
    ],
    controllers: [AjustesInventarioController],
    providers: [AjustesInventarioService],
})
export class AjustesInventarioModule { }

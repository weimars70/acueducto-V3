import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AjustesInventarioController } from './ajustes-inventario.controller';
import { AjustesInventarioService } from './ajustes-inventario.service';
import { AjusteInventario } from '../entities/ajuste-inventario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AjusteInventario])],
    controllers: [AjustesInventarioController],
    providers: [AjustesInventarioService],
})
export class AjustesInventarioModule { }

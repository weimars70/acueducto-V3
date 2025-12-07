import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { MovimientosInventarioController } from './movimientos-inventario.controller';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MovimientoInventario])],
    controllers: [MovimientosInventarioController],
    providers: [MovimientosInventarioService],
})
export class MovimientosInventarioModule { }

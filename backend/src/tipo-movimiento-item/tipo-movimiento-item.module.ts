import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoMovimientoItemService } from './tipo-movimiento-item.service';
import { TipoMovimientoItemController } from './tipo-movimiento-item.controller';
import { TipoMovimientoItem } from '../entities/tipo-movimiento-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TipoMovimientoItem])],
    controllers: [TipoMovimientoItemController],
    providers: [TipoMovimientoItemService],
    exports: [TipoMovimientoItemService]
})
export class TipoMovimientoItemModule { }

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';

@Injectable()
export class MovimientosInventarioService {
    constructor(
        @InjectRepository(MovimientoInventario)
        private readonly repository: Repository<MovimientoInventario>,
    ) { }

    findAll(empresaId: number) {
        return this.repository.find({
            where: { empresa_id: empresaId },
            order: { fecha_movimiento: 'DESC' }
        });
    }
}

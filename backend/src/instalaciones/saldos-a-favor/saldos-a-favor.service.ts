import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoSaldoAFavor } from './entities/saldo-a-favor.entity';
import { CreateMovimientoSaldoAFavorDto } from './dto/create-saldo-a-favor.dto';

@Injectable()
export class SaldosAFavorService {
    constructor(
        @InjectRepository(MovimientoSaldoAFavor)
        private readonly saldoRepository: Repository<MovimientoSaldoAFavor>,
    ) { }

    async create(createDto: CreateMovimientoSaldoAFavorDto): Promise<MovimientoSaldoAFavor> {
        // Calcular nuevo saldo: Obtener último saldo de la instalación
        const ultimoMovimiento = await this.saldoRepository.findOne({
            where: { instalacion: createDto.instalacion, empresaId: createDto.empresaId },
            order: { id: 'DESC' }
        });

        let saldoAnterior = 0;
        if (ultimoMovimiento && ultimoMovimiento.nuevoSaldo) {
            saldoAnterior = Number(ultimoMovimiento.nuevoSaldo);
        }

        const credito = Number(createDto.credito || 0);
        const debito = Number(createDto.debito || 0);

        // Nuevo saldo = Saldo Anterior + Credito - Debito
        // Asumimos saldos a favor suman con credito y restan con debito (uso del saldo)
        createDto.nuevoSaldo = saldoAnterior + credito - debito;
        // Aseguramos fecha actual si no viene
        if (!createDto.fecha) {
            createDto.fecha = new Date().toISOString().split('T')[0];
        }
        // Aseguramos factura por defecto
        if (!createDto.factura) {
            createDto.factura = 'SIN FACTURA';
        }

        const nuevoMovimiento = this.saldoRepository.create(createDto);
        return await this.saldoRepository.save(nuevoMovimiento);
    }

    async findAll(empresaId: number): Promise<MovimientoSaldoAFavor[]> {
        return await this.saldoRepository.find({
            where: { empresaId },
            order: { id: 'DESC' },
        });
    }
}

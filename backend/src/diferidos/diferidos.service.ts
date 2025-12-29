import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Diferido } from './entities/diferido.entity';
import { CreateDiferidoDto } from './dto/create-diferido.dto';
import { UpdateDiferidoDto } from './dto/update-diferido.dto';

@Injectable()
export class DiferidosService {
    constructor(
        @InjectRepository(Diferido)
        private readonly diferidoRepository: Repository<Diferido>,
        private readonly dataSource: DataSource,
    ) { }

    async getCuotasConexion(empresaId: number): Promise<any[]> {
        return this.dataSource.query(
            `SELECT * FROM view_cuotas_conexion WHERE empresa_id = $1`,
            [empresaId]
        );
    }

    async getCuotasMedidor(empresaId: number): Promise<any[]> {
        return this.dataSource.query(
            `SELECT * FROM view_cuotas_medidor WHERE empresa_id = $1`,
            [empresaId]
        );
    }

    async getAcuerdosPago(empresaId: number): Promise<any[]> {
        return this.dataSource.query(
            `SELECT * FROM cuotas_diferidos WHERE empresa_id = $1`,
            [empresaId]
        );
    }

    async create(createDto: CreateDiferidoDto): Promise<Diferido> {
        const diferido = this.diferidoRepository.create({
            ...createDto,
            cuotasPendientes: createDto.numeroCuotas,
            porInteres: createDto.porInteres || 0,
            valorCuota: createDto.valorCuota && createDto.valorCuota > 0
                ? createDto.valorCuota
                : (() => {
                    const monto = Number(createDto.montoOriginal);
                    const cuotas = Number(createDto.numeroCuotas);
                    const interes = Number(createDto.porInteres || 0);

                    if (interes === 0) return monto / cuotas;

                    const totalConInteres = monto + (monto * (interes / 100));
                    return totalConInteres / cuotas;
                })(),
            saldo: createDto.montoOriginal,
            estado: 'PENDIENTE'
        });
        return await this.diferidoRepository.save(diferido);
    }

    async findAll(empresaId?: number): Promise<Diferido[]> {
        const query = this.diferidoRepository.createQueryBuilder('diferido')
            .leftJoinAndSelect('diferido.contrato', 'contrato')
            .leftJoinAndSelect('diferido.concepto', 'concepto');

        if (empresaId) {
            query.where('diferido.empresaId = :empresaId', { empresaId });
        }

        query.orderBy('diferido.id', 'DESC');

        return await query.getMany();
    }

    async findOne(id: number): Promise<Diferido> {
        const diferido = await this.diferidoRepository.findOne({
            where: { id },
            relations: ['contrato', 'concepto']
        });

        if (!diferido) {
            throw new NotFoundException(`Diferido con ID ${id} no encontrado`);
        }
        return diferido;
    }

    async update(id: number, updateDto: UpdateDiferidoDto): Promise<Diferido> {
        const diferido = await this.findOne(id);
        const updated = Object.assign(diferido, updateDto);
        return await this.diferidoRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const diferido = await this.findOne(id);
        diferido.estado = 'ANULADO'; // Soft delete / Annulment logic
        await this.diferidoRepository.save(diferido);
    }
}

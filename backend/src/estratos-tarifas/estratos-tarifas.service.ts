import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstratoTarifa } from './entities/estrato-tarifa.entity';
import { CreateEstratoTarifaDto } from './dto/create-estrato-tarifa.dto';
import { UpdateEstratoTarifaDto } from './dto/update-estrato-tarifa.dto';

@Injectable()
export class EstratosTarifasService {
    constructor(
        @InjectRepository(EstratoTarifa)
        private readonly repository: Repository<EstratoTarifa>,
    ) { }

    async create(createDto: CreateEstratoTarifaDto): Promise<EstratoTarifa> {
        const item = this.repository.create(createDto);
        return await this.repository.save(item);
    }

    async findAll(empresaId?: number): Promise<EstratoTarifa[]> {
        const query = this.repository.createQueryBuilder('et');
        if (empresaId) {
            query.where('et.empresaId = :empresaId', { empresaId });
        }
        query.orderBy('et.codigo', 'ASC');
        return await query.getMany();
    }

    async findOne(codigo: number, tipo: number): Promise<EstratoTarifa> {
        const item = await this.repository.findOne({ where: { codigo, tipo } });
        if (!item) throw new NotFoundException(`EstratoTarifa #${codigo}-${tipo} not found`);
        return item;
    }

    async update(codigo: number, tipo: number, updateDto: UpdateEstratoTarifaDto): Promise<EstratoTarifa> {
        const item = await this.findOne(codigo, tipo);
        const updated = Object.assign(item, updateDto);
        return await this.repository.save(updated);
    }

    async remove(codigo: number, tipo: number): Promise<void> {
        const item = await this.findOne(codigo, tipo);
        await this.repository.remove(item);
    }
}

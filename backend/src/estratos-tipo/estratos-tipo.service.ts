import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstratoTipo } from './entities/estrato-tipo.entity';
import { CreateEstratoTipoDto } from './dto/create-estrato-tipo.dto';
import { UpdateEstratoTipoDto } from './dto/update-estrato-tipo.dto';

@Injectable()
export class EstratosTipoService {
    constructor(
        @InjectRepository(EstratoTipo)
        private readonly repository: Repository<EstratoTipo>,
    ) { }

    async create(createDto: CreateEstratoTipoDto): Promise<EstratoTipo> {
        const item = this.repository.create(createDto);
        return await this.repository.save(item);
    }

    async findAll(empresaId?: number): Promise<EstratoTipo[]> {
        const query = this.repository.createQueryBuilder('et');
        if (empresaId) {
            query.where('et.empresaId = :empresaId', { empresaId });
        }
        query.orderBy('et.codigo', 'ASC');
        return await query.getMany();
    }

    async findOne(codigo: number): Promise<EstratoTipo> {
        const item = await this.repository.findOne({ where: { codigo } });
        if (!item) throw new NotFoundException(`EstratoTipo #${codigo} not found`);
        return item;
    }

    async update(codigo: number, updateDto: UpdateEstratoTipoDto): Promise<EstratoTipo> {
        const item = await this.findOne(codigo);
        const updated = Object.assign(item, updateDto);
        return await this.repository.save(updated);
    }

    async remove(codigo: number): Promise<void> {
        const item = await this.findOne(codigo);
        await this.repository.remove(item);
    }
}

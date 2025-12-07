import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estrato } from './entities/estrato.entity';
import { CreateEstratoDto } from './dto/create-estrato.dto';
import { UpdateEstratoDto } from './dto/update-estrato.dto';

@Injectable()
export class EstratosService {
    constructor(
        @InjectRepository(Estrato)
        private readonly repository: Repository<Estrato>,
    ) { }

    async create(createDto: CreateEstratoDto): Promise<Estrato> {
        const item = this.repository.create(createDto);
        return await this.repository.save(item);
    }

    async findAll(empresaId?: number): Promise<Estrato[]> {
        const query = this.repository.createQueryBuilder('e');
        if (empresaId) {
            query.where('e.empresaId = :empresaId', { empresaId });
        }
        query.orderBy('e.codigo', 'ASC');
        return await query.getMany();
    }

    async findOne(codigo: number): Promise<Estrato> {
        const item = await this.repository.findOne({ where: { codigo } });
        if (!item) throw new NotFoundException(`Estrato #${codigo} not found`);
        return item;
    }

    async update(codigo: number, updateDto: UpdateEstratoDto): Promise<Estrato> {
        const item = await this.findOne(codigo);
        const updated = Object.assign(item, updateDto);
        return await this.repository.save(updated);
    }

    async remove(codigo: number): Promise<void> {
        const item = await this.findOne(codigo);
        await this.repository.remove(item);
    }
}

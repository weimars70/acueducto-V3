import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoMovimientoItem } from '../entities/tipo-movimiento-item.entity';
import { CreateTipoMovimientoItemDto } from './dto/create-tipo-movimiento-item.dto';
import { UpdateTipoMovimientoItemDto } from './dto/update-tipo-movimiento-item.dto';

@Injectable()
export class TipoMovimientoItemService {
    constructor(
        @InjectRepository(TipoMovimientoItem)
        private tipoMovimientoItemRepository: Repository<TipoMovimientoItem>,
    ) { }

    async create(createDto: CreateTipoMovimientoItemDto): Promise<TipoMovimientoItem> {
        const newItem = this.tipoMovimientoItemRepository.create({
            nombre: createDto.nombre,
            empresaId: createDto.empresa_id,
            usuario: createDto.usuario
        });
        return await this.tipoMovimientoItemRepository.save(newItem);
    }

    async findAll(empresaId: number): Promise<TipoMovimientoItem[]> {
        return await this.tipoMovimientoItemRepository.find({
            where: { empresaId },
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number, empresaId: number): Promise<TipoMovimientoItem> {
        const item = await this.tipoMovimientoItemRepository.findOne({
            where: { id, empresaId },
        });
        if (!item) {
            throw new NotFoundException(`TipoMovimientoItem with ID ${id} not found`);
        }
        return item;
    }

    async update(
        id: number,
        updateDto: UpdateTipoMovimientoItemDto,
    ): Promise<TipoMovimientoItem> {
        const item = await this.tipoMovimientoItemRepository.preload({
            id: id,
            ...updateDto,
            empresaId: updateDto.empresa_id
        });

        if (!item) {
            throw new NotFoundException(`TipoMovimientoItem with ID ${id} not found`);
        }

        return await this.tipoMovimientoItemRepository.save(item);
    }

    async remove(id: number): Promise<void> {
        const result = await this.tipoMovimientoItemRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`TipoMovimientoItem with ID ${id} not found`);
        }
    }
}

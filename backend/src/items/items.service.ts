import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
    ) { }

    async create(createDto: CreateItemDto): Promise<Item> {
        const newItem = this.itemRepository.create({
            codigo: createDto.codigo,
            nombre: createDto.nombre,
            precioSinIva: createDto.precio_sin_iva,
            porIva: createDto.por_iva,
            precioTotal: createDto.precio_total,
            grupo: createDto.grupo,
            inventarioActual: createDto.inventario_actual,
            empresaId: createDto.empresa_id,
            usuario: createDto.usuario,
            precioVenta: createDto.precio_venta
        });
        return await this.itemRepository.save(newItem);
    }

    async findAll(empresaId: number): Promise<Item[]> {
        return await this.itemRepository.find({
            where: { empresaId },
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number, empresaId: number): Promise<Item> {
        const item = await this.itemRepository.findOne({
            where: { id, empresaId },
        });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }

    async update(
        id: number,
        updateDto: UpdateItemDto,
    ): Promise<Item> {
        const item = await this.itemRepository.preload({
            id: id,
            ...updateDto,
            precioSinIva: updateDto.precio_sin_iva,
            porIva: updateDto.por_iva,
            precioTotal: updateDto.precio_total,
            inventarioActual: updateDto.inventario_actual,
            precioVenta: updateDto.precio_venta,
            empresaId: updateDto.empresa_id
        });

        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }

        return await this.itemRepository.save(item);
    }

    async remove(id: number): Promise<void> {
        const result = await this.itemRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
    }
}

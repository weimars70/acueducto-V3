import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemGrupo } from '../entities/item-grupo.entity';
import { CreateItemGrupoDto } from './dto/create-item-grupo.dto';
import { UpdateItemGrupoDto } from './dto/update-item-grupo.dto';

@Injectable()
export class ItemsGruposService {
    constructor(
        @InjectRepository(ItemGrupo)
        private itemGrupoRepository: Repository<ItemGrupo>,
    ) { }

    async create(createItemGrupoDto: CreateItemGrupoDto): Promise<ItemGrupo> {
        const newItemGrupo = this.itemGrupoRepository.create({
            nombre: createItemGrupoDto.nombre,
            empresaId: createItemGrupoDto.empresa_id,
            usuario: createItemGrupoDto.usuario
        });
        return await this.itemGrupoRepository.save(newItemGrupo);
    }

    async findAll(empresaId: number): Promise<ItemGrupo[]> {
        return await this.itemGrupoRepository.find({
            where: { empresaId },
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number, empresaId: number): Promise<ItemGrupo> {
        const itemGrupo = await this.itemGrupoRepository.findOne({
            where: { id, empresaId },
        });
        if (!itemGrupo) {
            throw new NotFoundException(`ItemGrupo with ID ${id} not found`);
        }
        return itemGrupo;
    }

    async update(
        id: number,
        updateItemGrupoDto: UpdateItemGrupoDto,
    ): Promise<ItemGrupo> {
        const itemGrupo = await this.itemGrupoRepository.preload({
            id: id,
            ...updateItemGrupoDto,
            empresaId: updateItemGrupoDto.empresa_id // Ensure map correctly
        });

        if (!itemGrupo) {
            throw new NotFoundException(`ItemGrupo with ID ${id} not found`);
        }

        return await this.itemGrupoRepository.save(itemGrupo);
    }

    async remove(id: number): Promise<void> {
        const result = await this.itemGrupoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`ItemGrupo with ID ${id} not found`);
        }
    }
}

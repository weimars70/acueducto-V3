import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { TipoPersona } from '../entities/tipo-persona.entity';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';

@Injectable()
export class TipoPersonaService {
    constructor(
        @InjectRepository(TipoPersona)
        private readonly tipoPersonaRepository: Repository<TipoPersona>,
    ) { }

    async create(createTipoPersonaDto: CreateTipoPersonaDto): Promise<TipoPersona> {
        const existing = await this.tipoPersonaRepository.findOne({
            where: [
                { codigo: createTipoPersonaDto.codigo },
                { nombre: createTipoPersonaDto.nombre }
            ]
        });

        if (existing) {
            throw new ConflictException('Ya existe un tipo de persona con ese código o nombre');
        }

        const tipoPersona = this.tipoPersonaRepository.create(createTipoPersonaDto);
        return await this.tipoPersonaRepository.save(tipoPersona);
    }

    async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ data: TipoPersona[], total: number }> {
        const skip = (page - 1) * limit;
        const queryBuilder = this.tipoPersonaRepository.createQueryBuilder('tipo_persona');

        if (filters?.nombre) {
            queryBuilder.andWhere('tipo_persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
        }

        const [data, total] = await queryBuilder
            .orderBy('tipo_persona.codigo', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async findOne(codigo: number): Promise<TipoPersona> {
        const tipoPersona = await this.tipoPersonaRepository.findOne({ where: { codigo } });
        if (!tipoPersona) {
            throw new NotFoundException(`Tipo de persona con código ${codigo} no encontrado`);
        }
        return tipoPersona;
    }

    async update(codigo: number, updateTipoPersonaDto: UpdateTipoPersonaDto): Promise<TipoPersona> {
        const tipoPersona = await this.findOne(codigo);

        if (updateTipoPersonaDto.nombre && updateTipoPersonaDto.nombre !== tipoPersona.nombre) {
            const existingName = await this.tipoPersonaRepository.findOne({
                where: { nombre: updateTipoPersonaDto.nombre }
            });
            if (existingName) {
                throw new ConflictException('Ya existe un tipo de persona con ese nombre');
            }
        }

        Object.assign(tipoPersona, updateTipoPersonaDto);
        return await this.tipoPersonaRepository.save(tipoPersona);
    }

    async remove(codigo: number): Promise<void> {
        const result = await this.tipoPersonaRepository.delete(codigo);
        if (result.affected === 0) {
            throw new NotFoundException(`Tipo de persona con código ${codigo} no encontrado`);
        }
    }
}

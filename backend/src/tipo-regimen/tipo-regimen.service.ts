import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoRegimen } from '../entities/tipo-regimen.entity';
import { CreateTipoRegimenDto } from './dto/create-tipo-regimen.dto';
import { UpdateTipoRegimenDto } from './dto/update-tipo-regimen.dto';

@Injectable()
export class TipoRegimenService {
    constructor(
        @InjectRepository(TipoRegimen)
        private readonly tipoRegimenRepository: Repository<TipoRegimen>,
    ) { }

    async create(createTipoRegimenDto: CreateTipoRegimenDto): Promise<TipoRegimen> {
        const existing = await this.tipoRegimenRepository.findOne({
            where: [
                { codigo: createTipoRegimenDto.codigo },
                { nombre: createTipoRegimenDto.nombre }
            ]
        });

        if (existing) {
            throw new ConflictException('Ya existe un tipo de regimen con ese código o nombre');
        }

        const tipoRegimen = this.tipoRegimenRepository.create(createTipoRegimenDto);
        return await this.tipoRegimenRepository.save(tipoRegimen);
    }

    async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ data: TipoRegimen[], total: number }> {
        const skip = (page - 1) * limit;
        const queryBuilder = this.tipoRegimenRepository.createQueryBuilder('tipo_regimen');

        if (filters?.nombre) {
            queryBuilder.andWhere('tipo_regimen.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
        }

        const [data, total] = await queryBuilder
            .orderBy('tipo_regimen.codigo', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async findOne(codigo: number): Promise<TipoRegimen> {
        const tipoRegimen = await this.tipoRegimenRepository.findOne({ where: { codigo } });
        if (!tipoRegimen) {
            throw new NotFoundException(`Tipo de regimen con código ${codigo} no encontrado`);
        }
        return tipoRegimen;
    }

    async update(codigo: number, updateTipoRegimenDto: UpdateTipoRegimenDto): Promise<TipoRegimen> {
        const tipoRegimen = await this.findOne(codigo);

        if (updateTipoRegimenDto.nombre && updateTipoRegimenDto.nombre !== tipoRegimen.nombre) {
            const existingName = await this.tipoRegimenRepository.findOne({
                where: { nombre: updateTipoRegimenDto.nombre }
            });
            if (existingName) {
                throw new ConflictException('Ya existe un tipo de regimen con ese nombre');
            }
        }

        Object.assign(tipoRegimen, updateTipoRegimenDto);
        return await this.tipoRegimenRepository.save(tipoRegimen);
    }

    async remove(codigo: number): Promise<void> {
        const result = await this.tipoRegimenRepository.delete(codigo);
        if (result.affected === 0) {
            throw new NotFoundException(`Tipo de regimen con código ${codigo} no encontrado`);
        }
    }
}

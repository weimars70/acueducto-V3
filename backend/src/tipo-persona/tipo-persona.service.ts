import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TipoPersona } from '../entities/tipo-persona.entity';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';

@Injectable()
export class TipoPersonaService {
    constructor(
        @InjectRepository(TipoPersona)
        private readonly tipoPersonaRepository: Repository<TipoPersona>,
        private readonly dataSource: DataSource,
    ) { }

    async create(createTipoPersonaDto: CreateTipoPersonaDto, empresaId: number, userId: number): Promise<TipoPersona> {
        // Obtener el nombre de usuario
        const userResult = await this.dataSource.query(
            'SELECT name FROM public.users WHERE id = $1',
            [userId]
        );
        const userName = userResult[0]?.name || String(userId);

        // Verificar si ya existe
        const existing = await this.tipoPersonaRepository.findOne({
            where: {
                nombre: createTipoPersonaDto.nombre,
                empresaId: empresaId
            }
        });

        if (existing) {
            throw new ConflictException('Ya existe un tipo de persona con ese nombre');
        }

        const tipoPersona = this.tipoPersonaRepository.create({
            nombre: createTipoPersonaDto.nombre,
            empresaId: empresaId,
            usuario: userName
        });

        return await this.tipoPersonaRepository.save(tipoPersona);
    }

    async findAll(empresaId: number): Promise<TipoPersona[]> {
        return await this.tipoPersonaRepository.find({
            where: { empresaId },
            order: { nombre: 'ASC' }
        });
    }

    async findOne(codigo: number, empresaId: number): Promise<TipoPersona> {
        const tipoPersona = await this.tipoPersonaRepository.findOne({
            where: { codigo, empresaId }
        });

        if (!tipoPersona) {
            throw new NotFoundException(`Tipo de persona con código ${codigo} no encontrado`);
        }

        return tipoPersona;
    }

    async update(codigo: number, updateTipoPersonaDto: UpdateTipoPersonaDto, empresaId: number, userId: number): Promise<TipoPersona> {
        const tipoPersona = await this.findOne(codigo, empresaId);

        // Obtener el nombre de usuario
        const userResult = await this.dataSource.query(
            'SELECT name FROM public.users WHERE id = $1',
            [userId]
        );
        const userName = userResult[0]?.name || String(userId);

        if (updateTipoPersonaDto.nombre && updateTipoPersonaDto.nombre !== tipoPersona.nombre) {
            const existingName = await this.tipoPersonaRepository.findOne({
                where: {
                    nombre: updateTipoPersonaDto.nombre,
                    empresaId: empresaId
                }
            });

            if (existingName) {
                throw new ConflictException('Ya existe un tipo de persona con ese nombre');
            }
        }

        tipoPersona.nombre = updateTipoPersonaDto.nombre || tipoPersona.nombre;
        tipoPersona.usuario = userName;

        return await this.tipoPersonaRepository.save(tipoPersona);
    }

    async remove(codigo: number, empresaId: number): Promise<void> {
        const result = await this.tipoPersonaRepository.delete({ codigo, empresaId });

        if (result.affected === 0) {
            throw new NotFoundException(`Tipo de persona con código ${codigo} no encontrado`);
        }
    }
}

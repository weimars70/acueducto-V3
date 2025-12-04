import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoIdent } from '../entities/tipo-ident.entity';
import { CreateTipoIdentDto } from './dto/create-tipo-ident.dto';
import { UpdateTipoIdentDto } from './dto/update-tipo-ident.dto';

@Injectable()
export class TipoIdentService {
    constructor(
        @InjectRepository(TipoIdent)
        private readonly tipoIdentRepository: Repository<TipoIdent>,
    ) { }

    async findAll(page: number, limit: number, filters: Record<string, any>) {
        try {
            let query = `
        SELECT
          codigo,
          nombre,
          abreviado,
          empresa_id,
          usuario
        FROM public.tipo_ident
        WHERE 1=1
      `;

            const queryParams: any[] = [];
            let paramCount = 1;

            // FILTRO OBLIGATORIO POR EMPRESA
            if (filters.empresaId) {
                query += ` AND empresa_id = $${paramCount}`;
                queryParams.push(filters.empresaId);
                paramCount++;
            }

            if (filters.nombre) {
                query += ` AND nombre ILIKE $${paramCount}`;
                queryParams.push(`%${filters.nombre}%`);
                paramCount++;
            }

            if (filters.codigo) {
                query += ` AND codigo = $${paramCount}`;
                queryParams.push(filters.codigo);
                paramCount++;
            }

            // Obtener el total de registros
            const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
            const totalResult = await this.tipoIdentRepository.query(
                countQuery,
                queryParams,
            );
            const total = parseInt(totalResult[0].count);

            // Agregar paginación
            query += ` ORDER BY codigo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, (page - 1) * limit);

            const data = await this.tipoIdentRepository.query(query, queryParams);

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new Error(`Error al obtener tipos de identificación: ${error.message}`);
        }
    }

    async findOne(codigo: number) {
        try {
            const tipoIdent = await this.tipoIdentRepository.findOne({
                where: { codigo },
            });

            if (!tipoIdent) {
                throw new Error(`Tipo de identificación con código ${codigo} no encontrado`);
            }

            return tipoIdent;
        } catch (error) {
            throw new Error(`Error al obtener tipo de identificación: ${error.message}`);
        }
    }

    async create(createTipoIdentDto: CreateTipoIdentDto) {
        try {
            // Verificar duplicados por código
            const existingCodigo = await this.tipoIdentRepository.findOne({
                where: { codigo: createTipoIdentDto.codigo },
            });

            if (existingCodigo) {
                throw new Error('Ya existe un tipo de identificación con este código');
            }

            // Verificar duplicados por nombre
            const existingNombre = await this.tipoIdentRepository.findOne({
                where: { nombre: createTipoIdentDto.nombre },
            });

            if (existingNombre) {
                throw new Error('Ya existe un tipo de identificación con este nombre');
            }

            const tipoIdent = this.tipoIdentRepository.create(createTipoIdentDto);
            return await this.tipoIdentRepository.save(tipoIdent);
        } catch (error) {
            throw new Error(`Error al crear tipo de identificación: ${error.message}`);
        }
    }

    async update(codigo: number, updateTipoIdentDto: UpdateTipoIdentDto) {
        try {
            const tipoIdent = await this.tipoIdentRepository.findOne({
                where: { codigo },
            });

            if (!tipoIdent) {
                throw new Error(`Tipo de identificación con código ${codigo} no encontrado`);
            }

            // Verificar duplicados por nombre si se está actualizando
            if (updateTipoIdentDto.nombre && updateTipoIdentDto.nombre !== tipoIdent.nombre) {
                const existingNombre = await this.tipoIdentRepository.findOne({
                    where: { nombre: updateTipoIdentDto.nombre },
                });

                if (existingNombre) {
                    throw new Error('Ya existe un tipo de identificación con este nombre');
                }
            }

            Object.assign(tipoIdent, updateTipoIdentDto);
            return await this.tipoIdentRepository.save(tipoIdent);
        } catch (error) {
            throw new Error(`Error al actualizar tipo de identificación: ${error.message}`);
        }
    }

    async remove(codigo: number) {
        try {
            const tipoIdent = await this.tipoIdentRepository.findOne({
                where: { codigo },
            });

            if (!tipoIdent) {
                throw new Error(`Tipo de identificación con código ${codigo} no encontrado`);
            }

            await this.tipoIdentRepository.remove(tipoIdent);
            return { message: 'Tipo de identificación eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar tipo de identificación: ${error.message}`);
        }
    }
}

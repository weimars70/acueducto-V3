import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoImpuesto } from '../entities/tipo-impuesto.entity';
import { CreateTipoImpuestoDto } from './dto/create-tipo-impuesto.dto';
import { UpdateTipoImpuestoDto } from './dto/update-tipo-impuesto.dto';

@Injectable()
export class TipoImpuestoService {
    constructor(
        @InjectRepository(TipoImpuesto)
        private readonly tipoImpuestoRepository: Repository<TipoImpuesto>,
    ) { }

    async findAll(page: number, limit: number, filters: Record<string, any>) {
        try {
            let query = `
        SELECT
          codigo,
          nombre,
          code,
          empresa_id,
          usuario
        FROM public.tipo_impuesto
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
            const totalResult = await this.tipoImpuestoRepository.query(
                countQuery,
                queryParams,
            );
            const total = parseInt(totalResult[0].count);

            // Agregar paginación
            query += ` ORDER BY codigo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, (page - 1) * limit);

            const data = await this.tipoImpuestoRepository.query(query, queryParams);

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new Error(`Error al obtener tipos de impuesto: ${error.message}`);
        }
    }

    async findOne(codigo: number) {
        try {
            const tipoImpuesto = await this.tipoImpuestoRepository.findOne({
                where: { codigo },
            });

            if (!tipoImpuesto) {
                throw new Error(`Tipo de impuesto con código ${codigo} no encontrado`);
            }

            return tipoImpuesto;
        } catch (error) {
            throw new Error(`Error al obtener tipo de impuesto: ${error.message}`);
        }
    }

    async create(createTipoImpuestoDto: CreateTipoImpuestoDto) {
        try {
            // Verificar duplicados por código
            const existingCodigo = await this.tipoImpuestoRepository.findOne({
                where: { codigo: createTipoImpuestoDto.codigo },
            });

            if (existingCodigo) {
                throw new Error('Ya existe un tipo de impuesto con este código');
            }

            // Verificar duplicados por nombre
            const existingNombre = await this.tipoImpuestoRepository.findOne({
                where: { nombre: createTipoImpuestoDto.nombre },
            });

            if (existingNombre) {
                throw new Error('Ya existe un tipo de impuesto con este nombre');
            }

            const tipoImpuesto = this.tipoImpuestoRepository.create(createTipoImpuestoDto);
            return await this.tipoImpuestoRepository.save(tipoImpuesto);
        } catch (error) {
            throw new Error(`Error al crear tipo de impuesto: ${error.message}`);
        }
    }

    async update(codigo: number, updateTipoImpuestoDto: UpdateTipoImpuestoDto) {
        try {
            const tipoImpuesto = await this.tipoImpuestoRepository.findOne({
                where: { codigo },
            });

            if (!tipoImpuesto) {
                throw new Error(`Tipo de impuesto con código ${codigo} no encontrado`);
            }

            // Verificar duplicados por nombre si se está actualizando
            if (updateTipoImpuestoDto.nombre && updateTipoImpuestoDto.nombre !== tipoImpuesto.nombre) {
                const existingNombre = await this.tipoImpuestoRepository.findOne({
                    where: { nombre: updateTipoImpuestoDto.nombre },
                });

                if (existingNombre) {
                    throw new Error('Ya existe un tipo de impuesto con este nombre');
                }
            }

            Object.assign(tipoImpuesto, updateTipoImpuestoDto);
            return await this.tipoImpuestoRepository.save(tipoImpuesto);
        } catch (error) {
            throw new Error(`Error al actualizar tipo de impuesto: ${error.message}`);
        }
    }

    async remove(codigo: number) {
        try {
            const tipoImpuesto = await this.tipoImpuestoRepository.findOne({
                where: { codigo },
            });

            if (!tipoImpuesto) {
                throw new Error(`Tipo de impuesto con código ${codigo} no encontrado`);
            }

            await this.tipoImpuestoRepository.remove(tipoImpuesto);
            return { message: 'Tipo de impuesto eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar tipo de impuesto: ${error.message}`);
        }
    }
}

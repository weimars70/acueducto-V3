import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tercero } from '../entities/tercero.entity';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { UpdateTerceroDto } from './dto/update-tercero.dto';

@Injectable()
export class TercerosService {
    constructor(
        @InjectRepository(Tercero)
        private readonly terceroRepository: Repository<Tercero>,
    ) { }

    // Métodos para cargar datos de selects
    async getCiudades(empresaId?: number) {
        const query = `SELECT codigo, nombre FROM public.ciudades${empresaId ? ' WHERE empresa_id = $1' : ''} ORDER BY nombre`;
        const params = empresaId ? [empresaId] : [];
        return await this.terceroRepository.query(query, params);
    }

    async getTipoRegimen(empresaId?: number) {
        const query = `SELECT codigo, nombre FROM public.tipo_regimen${empresaId ? ' WHERE empresa_id = $1' : ''} ORDER BY nombre`;
        const params = empresaId ? [empresaId] : [];
        return await this.terceroRepository.query(query, params);
    }

    async getTipoIdent(empresaId?: number) {
        const query = `SELECT codigo, nombre FROM public.tipo_ident${empresaId ? ' WHERE empresa_id = $1' : ''} ORDER BY nombre`;
        const params = empresaId ? [empresaId] : [];
        return await this.terceroRepository.query(query, params);
    }

    async getTipoImpuesto(empresaId?: number) {
        const query = `SELECT codigo, nombre FROM public.tipo_impuesto${empresaId ? ' WHERE empresa_id = $1' : ''} ORDER BY nombre`;
        const params = empresaId ? [empresaId] : [];
        return await this.terceroRepository.query(query, params);
    }

    async create(createTerceroDto: CreateTerceroDto) {
        try {
            const empresaId = createTerceroDto.empresaId;

            // Verificar duplicados por identificación dentro de la misma empresa
            if (createTerceroDto.identificacion) {
                const existingIdentificacion = await this.terceroRepository.findOne({
                    where: {
                        identificacion: createTerceroDto.identificacion,
                        empresaId: empresaId,
                    },
                });

                if (existingIdentificacion) {
                    throw new Error('Ya existe un tercero con esta identificación en esta empresa');
                }
            }

            const tercero = this.terceroRepository.create(createTerceroDto);
            return await this.terceroRepository.save(tercero);
        } catch (error) {
            throw new Error(`Error al crear tercero: ${error.message}`);
        }
    }

    async findAll(params?: { page?: number; limit?: number; empresaId?: number; nombre?: string; identificacion?: string; cliente?: boolean; proveedor?: boolean }) {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const skip = (page - 1) * limit;

        // Construir query usando view_terceros
        let query = `
            SELECT codigo, ciudad_codigo, ciudad_nombre, identificacion, dv, nombres, 
                   primer_apellido, segundo_apellido, nombre, direccion, telefono, email, 
                   regimen, tipo_regimen_nombre, tipo_ident, tipo_ident_nombre,
                   tipo_impuesto, tipo_impuesto_nombre, cliente, proveedor, activo
            FROM public.view_terceros
            WHERE 1=1
        `;

        const queryParams: any[] = [];
        let paramCount = 1;

        // FILTRO OBLIGATORIO POR EMPRESA - TEMPORALMENTE COMENTADO PARA DEBUG
        // if (params?.empresaId) {
        //     query += ` AND empresa_id = $${paramCount}`;
        //     queryParams.push(params.empresaId);
        //     paramCount++;
        // }

        if (params?.nombre) {
            query += ` AND nombre ILIKE $${paramCount}`;
            queryParams.push(`%${params.nombre}%`);
            paramCount++;
        }

        if (params?.identificacion) {
            query += ` AND identificacion ILIKE $${paramCount}`;
            queryParams.push(`%${params.identificacion}%`);
            paramCount++;
        }

        if (params?.cliente !== undefined) {
            query += ` AND cliente = $${paramCount}`;
            queryParams.push(params.cliente);
            paramCount++;
        }

        if (params?.proveedor !== undefined) {
            query += ` AND proveedor = $${paramCount}`;
            queryParams.push(params.proveedor);
            paramCount++;
        }

        // Obtener total
        const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
        const totalResult = await this.terceroRepository.query(countQuery, queryParams);
        const total = parseInt(totalResult[0].count);

        // Agregar paginación
        query += ` ORDER BY nombre LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(limit, skip);

        const data = await this.terceroRepository.query(query, queryParams);

        console.log('=== TERCEROS QUERY DEBUG ===');
        console.log('Query executed successfully');
        console.log('Total rows:', total);
        if (data.length > 0) {
            console.log('Available columns:', Object.keys(data[0]));
        }

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async findOne(codigo: number, empresaId?: number) {
        const where: any = { codigo };
        if (empresaId) {
            where.empresaId = empresaId;
        }

        const tercero = await this.terceroRepository.findOne({ where });
        if (!tercero) {
            throw new Error(`Tercero con código ${codigo} no encontrado`);
        }
        return tercero;
    }

    async update(codigo: number, updateTerceroDto: UpdateTerceroDto) {
        try {
            const tercero = await this.terceroRepository.findOne({
                where: { codigo },
            });

            if (!tercero) {
                throw new Error(`Tercero con código ${codigo} no encontrado`);
            }

            // Verificar duplicados por identificación si se está actualizando
            if (updateTerceroDto.identificacion && updateTerceroDto.identificacion !== tercero.identificacion) {
                const existingIdentificacion = await this.terceroRepository.findOne({
                    where: {
                        identificacion: updateTerceroDto.identificacion,
                        empresaId: tercero.empresaId,
                    },
                });

                if (existingIdentificacion) {
                    throw new Error('Ya existe un tercero con esta identificación en esta empresa');
                }
            }

            Object.assign(tercero, updateTerceroDto);
            return await this.terceroRepository.save(tercero);
        } catch (error) {
            throw new Error(`Error al actualizar tercero: ${error.message}`);
        }
    }

    async remove(codigo: number) {
        try {
            const tercero = await this.terceroRepository.findOne({
                where: { codigo },
            });

            if (!tercero) {
                throw new Error(`Tercero con código ${codigo} no encontrado`);
            }

            await this.terceroRepository.remove(tercero);
            return { message: 'Tercero eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar tercero: ${error.message}`);
        }
    }
}

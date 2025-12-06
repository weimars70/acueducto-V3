import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tercero } from '../entities/tercero.entity';
import { TerceroContacto } from '../entities/tercero-contacto.entity';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { UpdateTerceroDto } from './dto/update-tercero.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';

@Injectable()
export class TercerosService {
    constructor(
        @InjectRepository(Tercero)
        private readonly terceroRepository: Repository<Tercero>,
        @InjectRepository(TerceroContacto)
        private readonly contactoRepository: Repository<TerceroContacto>,
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

    async create(createTerceroDto: any) {
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

            // Extraer contactos del DTO
            const { contactos, ...terceroData } = createTerceroDto;

            // Crear y guardar tercero
            const tercero = this.terceroRepository.create(terceroData) as unknown as Tercero;
            const terceroGuardado = await this.terceroRepository.save(tercero);

            // Guardar contactos si existen
            if (contactos && contactos.length > 0) {
                for (const contacto of contactos) {
                    const queryInsert = `
                        INSERT INTO public.contactos_tercero (id_tercero, cargo, nombre, telefono, direccion, correo)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `;
                    await this.terceroRepository.query(queryInsert, [
                        terceroGuardado.codigo,
                        contacto.cargo,
                        contacto.nombre,
                        contacto.telefono,
                        contacto.direccion,
                        contacto.correo
                    ]);
                }
            }

            return terceroGuardado;
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

    // =================== MÉTODOS PARA CONTACTOS ===================

    // Obtener tipos de contacto
    async getTiposContacto() {
        const query = `SELECT codigo, nombre FROM public.contactos_tipo ORDER BY nombre`;
        const tiposContacto = await this.contactoRepository.query(query);
        console.log('=== TIPOS CONTACTO DEBUG ===', tiposContacto);
        return tiposContacto;
    }

    // Listar contactos de un tercero
    async findContactosByTercero(terceroCodigo: number) {
        try {
            const query = `
                SELECT
                    tc.id as "codigo",
                    tc.tercero_codigo as "terceroCodigo",
                    tc.tipo_contacto as "tipoContacto",
                    ct.nombre as "tipoContactoNombre",
                    tc.nombre as "nombre",
                    tc.telefono as "telefono",
                    tc.direccion as "direccion",
                    tc.correo as "correo"
                FROM terceros_contactos tc
                LEFT JOIN contactos_tipo ct ON tc.tipo_contacto = ct.codigo
                WHERE tc.tercero_codigo = $1
                ORDER BY tc.nombre
            `;
            return await this.contactoRepository.query(query, [terceroCodigo]);
        } catch (error) {
            throw new Error(`Error al listar contactos: ${error.message}`);
        }
    }

    // Crear contacto
    async createContacto(createContactoDto: CreateContactoDto) {
        try {
            // Verificar que el tercero existe
            const tercero = await this.terceroRepository.findOne({
                where: { codigo: createContactoDto.terceroCodigo },
            });

            if (!tercero) {
                throw new Error(`Tercero con código ${createContactoDto.terceroCodigo} no encontrado`);
            }

            const contacto = this.contactoRepository.create(createContactoDto);
            return await this.contactoRepository.save(contacto);
        } catch (error) {
            throw new Error(`Error al crear contacto: ${error.message}`);
        }
    }

    // Obtener contacto por código
    async findOneContacto(codigo: number) {
        try {
            const contacto = await this.contactoRepository.findOne({
                where: { codigo },
            });

            if (!contacto) {
                throw new Error(`Contacto con código ${codigo} no encontrado`);
            }

            return contacto;
        } catch (error) {
            throw new Error(`Error al obtener contacto: ${error.message}`);
        }
    }

    // Actualizar contacto
    async updateContacto(codigo: number, updateContactoDto: UpdateContactoDto) {
        try {
            const contacto = await this.contactoRepository.findOne({
                where: { codigo },
            });

            if (!contacto) {
                throw new Error(`Contacto con código ${codigo} no encontrado`);
            }

            Object.assign(contacto, updateContactoDto);
            return await this.contactoRepository.save(contacto);
        } catch (error) {
            throw new Error(`Error al actualizar contacto: ${error.message}`);
        }
    }

    // Eliminar contacto
    async removeContacto(codigo: number) {
        try {
            const contacto = await this.contactoRepository.findOne({
                where: { codigo },
            });

            if (!contacto) {
                throw new Error(`Contacto con código ${codigo} no encontrado`);
            }

            await this.contactoRepository.remove(contacto);
            return { message: 'Contacto eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar contacto: ${error.message}`);
        }
    }
}

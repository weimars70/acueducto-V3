import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instalacion } from './entities/instalacion.entity';
import { CreateInstalacionDto } from './dto/create-instalacion.dto';
import { UpdateInstalacionDto } from './dto/update-instalacion.dto';

@Injectable()
export class InstalacionesService {
  constructor(
    @InjectRepository(Instalacion)
    private readonly instalacionRepository: Repository<Instalacion>,
  ) { }

  async create(createInstalacionDto: CreateInstalacionDto): Promise<Instalacion> {
    try {
      const instalacion = this.instalacionRepository.create(createInstalacionDto);
      return await this.instalacionRepository.save(instalacion);
    } catch (error) {
      throw new Error(`Error al crear instalación: ${error.message}`);
    }
  }

  async update(codigo: number, updateInstalacionDto: UpdateInstalacionDto): Promise<Instalacion> {
    try {
      const instalacion = await this.instalacionRepository.findOne({ where: { codigo } });

      if (!instalacion) {
        throw new NotFoundException(`Instalación con código ${codigo} no encontrada`);
      }

      Object.assign(instalacion, updateInstalacionDto);
      return await this.instalacionRepository.save(instalacion);
    } catch (error) {
      throw new Error(`Error al actualizar instalación: ${error.message}`);
    }
  }

  async findOne(codigo: number) {
    try {
      const query = `
        SELECT * FROM view_instalaciones
        WHERE codigo = $1
        LIMIT 1
      `;

      const result = await this.instalacionRepository.query(query, [codigo]);

      if (!result || result.length === 0) {
        throw new NotFoundException(`Instalación con código ${codigo} no encontrada`);
      }

      return result[0];
    } catch (error) {
      console.log('Error::.', error);
      // Re-throw NotFoundException sin envolverlo
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al obtener instalación: ${error.message}`);
    }
  }

  async findAll(empresaId?: number, search?: string) {
    try {
      let query = 'SELECT * FROM view_instalaciones WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (empresaId) {
        query += ` AND empresa_id = $${paramCount}`;
        params.push(empresaId);
        paramCount++;
      }

      if (search) {
        const searchNumber = Number(search);
        if (!isNaN(searchNumber)) {
          query += ` AND (codigo = $${paramCount} OR nombre ILIKE $${paramCount + 1})`;
          params.push(searchNumber, `%${search}%`);
          paramCount += 2;
        } else {
          query += ` AND nombre ILIKE $${paramCount}`;
          params.push(`%${search}%`);
          paramCount++;
        }
      }

      query += ' ORDER BY codigo ASC LIMIT 20';

      return await this.instalacionRepository.query(query, params);
    } catch (error) {
      throw new Error(`Error al obtener instalaciones: ${error.message}`);
    }
  }

  async findAllPaginated(
    empresaId: number,
    page: number = 1,
    limit: number = 20,
    filters?: Record<string, any>
  ) {
    try {
      let query = `
        SELECT codigo, nombre, ident, direccion, telefono, ciudad_codigo, ciudad_nombre,
        estrato_codigo, estrato_nombre, sector_codigo, sector_nombre, activo, marca_codigo, marca_nombre,
        uso_codigo, uso_nombre, prefijo, nombres, primer_apellido, segundo_apellido, factura_fisica, orden,
        email, dv, regimen, n_regimen, tipo_persona, n_tipo_persona, tipo_impuesto, n_tipo_impuesto, cliente, sector,
        suscriptor, centro_costos, n_centro_costos, saldo_a_favor, empresa_id, enviar_factura_email, enviar_factura_whatsapp
        FROM view_instalaciones
        WHERE empresa_id = $1
      `;

      const queryParams: any[] = [empresaId];
      let paramCount = 2;

      // Aplicar filtros
      if (filters) {
        if (filters.codigo && filters.codigo.trim()) {
          query += ` AND codigo::text ILIKE $${paramCount}`;
          queryParams.push(`%${filters.codigo.trim()}%`);
          paramCount++;
        }

        if (filters.nombre && filters.nombre.trim()) {
          query += ` AND nombre ILIKE $${paramCount}`;
          queryParams.push(`%${filters.nombre.trim()}%`);
          paramCount++;
        }

        if (filters.ident && filters.ident.trim()) {
          query += ` AND ident ILIKE $${paramCount}`;
          queryParams.push(`%${filters.ident.trim()}%`);
          paramCount++;
        }

        if (filters.suscriptor && filters.suscriptor.trim()) {
          query += ` AND suscriptor ILIKE $${paramCount}`;
          queryParams.push(`%${filters.suscriptor.trim()}%`);
          paramCount++;
        }

        if (filters.direccion && filters.direccion.trim()) {
          query += ` AND direccion ILIKE $${paramCount}`;
          queryParams.push(`%${filters.direccion.trim()}%`);
          paramCount++;
        }

        if (filters.sector_nombre && filters.sector_nombre.trim()) {
          query += ` AND sector_nombre ILIKE $${paramCount}`;
          queryParams.push(`%${filters.sector_nombre.trim()}%`);
          paramCount++;
        }

        if (filters.activo !== undefined && filters.activo !== null) {
          query += ` AND activo = $${paramCount}`;
          queryParams.push(filters.activo);
          paramCount++;
        }
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.instalacionRepository.query(countQuery, queryParams);
      const total = parseInt(totalResult[0].count);

      // Agregar ordenamiento y paginación
      query += ` ORDER BY codigo ASC`;
      if (limit > 0) {
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(limit, (page - 1) * limit);
      }

      const data = await this.instalacionRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error al obtener instalaciones paginadas:', error);
      throw new Error(`Error al obtener instalaciones: ${error.message}`);
    }
  }
}

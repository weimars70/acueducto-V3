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
      console.log('🔍 InstalacionesService.findOne - Buscando código:', codigo);

      const query = `
        SELECT * FROM view_instalaciones
        WHERE codigo = $1
        LIMIT 1
      `;

      const result = await this.instalacionRepository.query(query, [codigo]);
      console.log('📊 Query result from view_instalaciones:', result);

      if (!result || result.length === 0) {
        throw new NotFoundException(`Instalación con código ${codigo} no encontrada`);
      }

      const instalacion = result[0];
      console.log('📋 Instalación desde view_instalaciones:', instalacion);
      console.log('📋 Campos específicos de la vista:', {
        codigo: instalacion.codigo,
        nombre: instalacion.nombre,
        codigo_medidor: instalacion.codigo_medidor,
        lectura_anterior: instalacion.lectura_anterior,
        promedio: instalacion.promedio,
        tiene_lectura_anterior: 'lectura_anterior' in instalacion,
        tiene_promedio: 'promedio' in instalacion
      });

      // Verificar si necesitamos obtener lectura_anterior y promedio de otra fuente
      const needsLectura = !instalacion.lectura_anterior && instalacion.lectura_anterior !== 0;
      const needsPromedio = !instalacion.promedio && instalacion.promedio !== 0;

      if (needsLectura || needsPromedio) {
        console.log('⚠️ view_instalaciones no tiene lectura_anterior o promedio, consultando get_previous_reading()');
        console.log('📊 Parámetros: codigo =', codigo, ', empresa_id =', instalacion.empresa_id);

        // get_previous_reading devuelve un objeto con lectura_anterior y promedio
        const lecturaQuery = `SELECT * FROM get_previous_reading($1, $2)`;
        const lecturaResult = await this.instalacionRepository.query(lecturaQuery, [codigo, instalacion.empresa_id]);
        console.log('📊 Resultado completo de get_previous_reading():', lecturaResult);

        if (lecturaResult && lecturaResult.length > 0) {
          const datos = lecturaResult[0];
          instalacion.lectura_anterior = datos.lectura_anterior || 0;
          instalacion.promedio = datos.promedio || 0;
          console.log('✅ Datos obtenidos de get_previous_reading():', {
            lectura_anterior: instalacion.lectura_anterior,
            promedio: instalacion.promedio
          });
        } else {
          console.warn('⚠️ get_previous_reading() no devolvió datos, usando valores por defecto');
          instalacion.lectura_anterior = 0;
          instalacion.promedio = 0;
        }
      }

      console.log('✅ Instalación final a devolver:', {
        codigo: instalacion.codigo,
        nombre: instalacion.nombre,
        lectura_anterior: instalacion.lectura_anterior,
        promedio: instalacion.promedio
      });

      return instalacion;
    } catch (error) {
      console.log('❌ Error en findOne:', error);
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

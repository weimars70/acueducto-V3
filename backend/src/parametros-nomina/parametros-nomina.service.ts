import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParametroNomina } from '../entities/parametro-nomina.entity';
import { CreateParametroNominaDto } from './dto/create-parametro-nomina.dto';
import { UpdateParametroNominaDto } from './dto/update-parametro-nomina.dto';
import { DuplicateYearDto } from './dto/duplicate-year.dto';

@Injectable()
export class ParametrosNominaService {
  constructor(
    @InjectRepository(ParametroNomina)
    private readonly parametroRepository: Repository<ParametroNomina>,
  ) { }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          id,
          codigo,
          nombre,
          descripcion,
          valor,
          anio,
          empresa_id,
          fecha_creacion,
          usuario_creacion
        FROM public.parametros_nomina
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

      if (filters.anio) {
        query += ` AND anio = $${paramCount}`;
        queryParams.push(filters.anio);
        paramCount++;
      }

      if (filters.codigo) {
        query += ` AND codigo ILIKE $${paramCount}`;
        queryParams.push(`%${filters.codigo}%`);
        paramCount++;
      }

      if (filters.nombre) {
        query += ` AND nombre ILIKE $${paramCount}`;
        queryParams.push(`%${filters.nombre}%`);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.parametroRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY codigo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.parametroRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener parámetros de nómina: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const parametro = await this.parametroRepository.findOne({
        where: { id },
      });

      if (!parametro) {
        throw new Error(`Parámetro con ID ${id} no encontrado`);
      }

      return parametro;
    } catch (error) {
      throw new Error(`Error al obtener parámetro: ${error.message}`);
    }
  }

  async getDistinctYears(empresaId: number) {
    try {
      const result = await this.parametroRepository.query(
        `SELECT DISTINCT anio FROM parametros_nomina WHERE empresa_id = $1 ORDER BY anio DESC`,
        [empresaId]
      );
      return result.map(r => r.anio);
    } catch (error) {
      throw new Error(`Error al obtener años: ${error.message}`);
    }
  }

  async create(createParametroDto: CreateParametroNominaDto) {
    try {
      const empresaId = createParametroDto.empresaId;

      // Verificar duplicados por código y año dentro de la misma empresa
      const existing = await this.parametroRepository.findOne({
        where: {
          codigo: createParametroDto.codigo,
          anio: createParametroDto.anio,
          empresaId: empresaId,
        },
      });

      if (existing) {
        throw new Error('Ya existe un parámetro con este código y año en esta empresa');
      }

      const parametro = this.parametroRepository.create(createParametroDto);
      return await this.parametroRepository.save(parametro);
    } catch (error) {
      throw new Error(`Error al crear parámetro: ${error.message}`);
    }
  }

  async update(id: number, updateParametroDto: UpdateParametroNominaDto) {
    try {
      const parametro = await this.parametroRepository.findOne({
        where: { id },
      });

      if (!parametro) {
        throw new Error(`Parámetro con ID ${id} no encontrado`);
      }

      // Verificar duplicados por código y año si se están actualizando
      if ((updateParametroDto.codigo || updateParametroDto.anio) &&
        (updateParametroDto.codigo !== parametro.codigo || updateParametroDto.anio !== parametro.anio)) {
        const existing = await this.parametroRepository.findOne({
          where: {
            codigo: updateParametroDto.codigo || parametro.codigo,
            anio: updateParametroDto.anio || parametro.anio,
            empresaId: parametro.empresaId
          },
        });

        if (existing && existing.id !== id) {
          throw new Error('Ya existe un parámetro con este código y año en esta empresa');
        }
      }

      Object.assign(parametro, updateParametroDto);
      return await this.parametroRepository.save(parametro);
    } catch (error) {
      throw new Error(`Error al actualizar parámetro: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const parametro = await this.parametroRepository.findOne({
        where: { id },
      });

      if (!parametro) {
        throw new Error(`Parámetro con ID ${id} no encontrado`);
      }

      await this.parametroRepository.remove(parametro);
      return { message: 'Parámetro eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar parámetro: ${error.message}`);
    }
  }

  async duplicateYear(duplicateDto: DuplicateYearDto, empresaId: number, usuarioId: number) {
    try {
      const { sourceYear, targetYear } = duplicateDto;

      // Verificar que no existan parámetros para el año destino
      const existingCount = await this.parametroRepository.query(
        `SELECT COUNT(*) as count FROM parametros_nomina WHERE anio = $1 AND empresa_id = $2`,
        [targetYear, empresaId]
      );

      if (parseInt(existingCount[0].count) > 0) {
        throw new Error(`Ya existen parámetros para el año ${targetYear}. Elimínelos primero si desea duplicar.`);
      }

      // Verificar que existan parámetros en el año origen
      const sourceCount = await this.parametroRepository.query(
        `SELECT COUNT(*) as count FROM parametros_nomina WHERE anio = $1 AND empresa_id = $2`,
        [sourceYear, empresaId]
      );

      if (parseInt(sourceCount[0].count) === 0) {
        throw new Error(`No existen parámetros para el año ${sourceYear}`);
      }

      // Duplicar parámetros usando INSERT ... SELECT
      const sql = `INSERT INTO parametros_nomina
         (codigo, nombre, descripcion, valor, anio, empresa_id, usuario_creacion)
         SELECT codigo, nombre, descripcion, valor, $1, $2, $3
         FROM parametros_nomina
         WHERE empresa_id = $2 AND anio = $4
         RETURNING id`;

      console.log('sql  ', sql);
      console.log('targetYear  ', targetYear);
      console.log('empresaId  ', empresaId);
      console.log('usuarioId  ', usuarioId);
      console.log('sourceYear  ', sourceYear);
      const result = await this.parametroRepository.query(
        sql,
        [targetYear, empresaId, usuarioId, sourceYear]
      );


      return {
        message: `Se duplicaron ${result.length} parámetros del año ${sourceYear} al año ${targetYear}`,
        count: result.length,
      };
    } catch (error) {
      throw new Error(`Error al duplicar año: ${error.message}`);
    }
  }
}

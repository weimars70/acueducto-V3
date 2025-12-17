import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConceptoNomina } from '../entities/concepto-nomina.entity';
import { CreateConceptoNominaDto } from './dto/create-concepto-nomina.dto';
import { UpdateConceptoNominaDto } from './dto/update-concepto-nomina.dto';

@Injectable()
export class ConceptosNominaService {
  constructor(
    @InjectRepository(ConceptoNomina)
    private readonly conceptoRepository: Repository<ConceptoNomina>,
  ) { }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          id,
          codigo,
          nombre,
          descripcion,
          tipo,
          subtipo,
          formula,
          porcentaje,
          activo,
          empresa_id,
          fecha_creacion
        FROM public.conceptos_nomina
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

      if (filters.tipo) {
        query += ` AND tipo = $${paramCount}`;
        queryParams.push(filters.tipo);
        paramCount++;
      }

      if (filters.activo !== undefined) {
        query += ` AND activo = $${paramCount}`;
        queryParams.push(filters.activo);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.conceptoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY codigo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.conceptoRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener conceptos de nómina: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const concepto = await this.conceptoRepository.findOne({
        where: { id },
      });

      if (!concepto) {
        throw new Error(`Concepto con ID ${id} no encontrado`);
      }

      return concepto;
    } catch (error) {
      throw new Error(`Error al obtener concepto: ${error.message}`);
    }
  }

  async create(createConceptoDto: CreateConceptoNominaDto) {
    try {
      const empresaId = createConceptoDto.empresaId;

      // Verificar duplicados por código dentro de la misma empresa
      const existingCodigo = await this.conceptoRepository.findOne({
        where: {
          codigo: createConceptoDto.codigo,
          empresaId: empresaId,
        },
      });

      if (existingCodigo) {
        throw new Error('Ya existe un concepto con este código en esta empresa');
      }

      const concepto = this.conceptoRepository.create(createConceptoDto);
      return await this.conceptoRepository.save(concepto);
    } catch (error) {
      throw new Error(`Error al crear concepto: ${error.message}`);
    }
  }

  async update(id: number, updateConceptoDto: UpdateConceptoNominaDto) {
    try {
      const concepto = await this.conceptoRepository.findOne({
        where: { id },
      });

      if (!concepto) {
        throw new Error(`Concepto con ID ${id} no encontrado`);
      }

      // Verificar duplicados por código si se está actualizando
      if (updateConceptoDto.codigo && updateConceptoDto.codigo !== concepto.codigo) {
        const existingCodigo = await this.conceptoRepository.findOne({
          where: {
            codigo: updateConceptoDto.codigo,
            empresaId: concepto.empresaId
          },
        });

        if (existingCodigo) {
          throw new Error('Ya existe un concepto con este código en esta empresa');
        }
      }

      Object.assign(concepto, updateConceptoDto);
      return await this.conceptoRepository.save(concepto);
    } catch (error) {
      throw new Error(`Error al actualizar concepto: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const concepto = await this.conceptoRepository.findOne({
        where: { id },
      });

      if (!concepto) {
        throw new Error(`Concepto con ID ${id} no encontrado`);
      }

      await this.conceptoRepository.remove(concepto);
      return { message: 'Concepto eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }
}

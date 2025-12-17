import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoNomina } from '../entities/periodo-nomina.entity';
import { CreatePeriodoNominaDto } from './dto/create-periodo-nomina.dto';
import { UpdatePeriodoNominaDto } from './dto/update-periodo-nomina.dto';

@Injectable()
export class PeriodosNominaService {
  constructor(
    @InjectRepository(PeriodoNomina)
    private readonly periodoRepository: Repository<PeriodoNomina>,
  ) { }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          id,
          nombre,
          fecha_inicio,
          fecha_fin,
          dias_periodo,
          estado,
          empresa_id,
          fecha_creacion,
          usuario_creacion,
          fecha_cierre,
          fecha_pago
        FROM public.periodos_nomina
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

      if (filters.estado) {
        query += ` AND estado = $${paramCount}`;
        queryParams.push(filters.estado);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.periodoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY fecha_inicio DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.periodoRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener períodos de nómina: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });

      if (!periodo) {
        throw new Error(`Período con ID ${id} no encontrado`);
      }

      return periodo;
    } catch (error) {
      throw new Error(`Error al obtener período: ${error.message}`);
    }
  }

  async create(createPeriodoDto: CreatePeriodoNominaDto) {
    try {
      const periodo = this.periodoRepository.create(createPeriodoDto);
      return await this.periodoRepository.save(periodo);
    } catch (error) {
      throw new Error(`Error al crear período: ${error.message}`);
    }
  }

  async update(id: number, updatePeriodoDto: UpdatePeriodoNominaDto) {
    try {
      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });

      if (!periodo) {
        throw new Error(`Período con ID ${id} no encontrado`);
      }

      Object.assign(periodo, updatePeriodoDto);
      return await this.periodoRepository.save(periodo);
    } catch (error) {
      throw new Error(`Error al actualizar período: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });

      if (!periodo) {
        throw new Error(`Período con ID ${id} no encontrado`);
      }

      await this.periodoRepository.remove(periodo);
      return { message: 'Período eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar período: ${error.message}`);
    }
  }

  async cerrarPeriodo(id: number) {
    try {
      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });

      if (!periodo) {
        throw new Error(`Período con ID ${id} no encontrado`);
      }

      periodo.estado = 'CERRADO';
      periodo.fecha_cierre = new Date();
      return await this.periodoRepository.save(periodo);
    } catch (error) {
      throw new Error(`Error al cerrar período: ${error.message}`);
    }
  }

  async marcarComoPagado(id: number) {
    try {
      const periodo = await this.periodoRepository.findOne({
        where: { id },
      });

      if (!periodo) {
        throw new Error(`Período con ID ${id} no encontrado`);
      }

      periodo.estado = 'PAGADO';
      periodo.fecha_pago = new Date();
      return await this.periodoRepository.save(periodo);
    } catch (error) {
      throw new Error(`Error al marcar período como pagado: ${error.message}`);
    }
  }
}

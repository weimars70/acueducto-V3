import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) { }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          id,
          cedula,
          nombre_completo,
          nombre_corto,
          salario_mensual,
          auxilio_transporte,
          activo,
          fecha_ingreso,
          fecha_retiro,
          cargo,
          empresa_id,
          fecha_creacion,
          usuario_creacion
        FROM public.empleados
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

      if (filters.cedula) {
        query += ` AND cedula ILIKE $${paramCount}`;
        queryParams.push(`%${filters.cedula}%`);
        paramCount++;
      }

      if (filters.nombre_completo) {
        query += ` AND nombre_completo ILIKE $${paramCount}`;
        queryParams.push(`%${filters.nombre_completo}%`);
        paramCount++;
      }

      if (filters.activo !== undefined) {
        query += ` AND activo = $${paramCount}`;
        queryParams.push(filters.activo);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.empleadoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY id DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.empleadoRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener empleados: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const empleado = await this.empleadoRepository.findOne({
        where: { id },
      });

      if (!empleado) {
        throw new Error(`Empleado con ID ${id} no encontrado`);
      }

      return empleado;
    } catch (error) {
      throw new Error(`Error al obtener empleado: ${error.message}`);
    }
  }

  async create(createEmpleadoDto: CreateEmpleadoDto) {
    try {
      const empresaId = createEmpleadoDto.empresaId;

      // Verificar duplicados por cédula dentro de la misma empresa
      const existingCedula = await this.empleadoRepository.findOne({
        where: {
          cedula: createEmpleadoDto.cedula,
          empresaId: empresaId,
        },
      });

      if (existingCedula) {
        throw new Error('Ya existe un empleado con esta cédula en esta empresa');
      }

      const empleado = this.empleadoRepository.create(createEmpleadoDto);
      return await this.empleadoRepository.save(empleado);
    } catch (error) {
      throw new Error(`Error al crear empleado: ${error.message}`);
    }
  }

  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto) {
    try {
      const empleado = await this.empleadoRepository.findOne({
        where: { id },
      });

      if (!empleado) {
        throw new Error(`Empleado con ID ${id} no encontrado`);
      }

      // Verificar duplicados por cédula si se está actualizando
      if (updateEmpleadoDto.cedula && updateEmpleadoDto.cedula !== empleado.cedula) {
        const existingCedula = await this.empleadoRepository.findOne({
          where: {
            cedula: updateEmpleadoDto.cedula,
            empresaId: empleado.empresaId
          },
        });

        if (existingCedula) {
          throw new Error('Ya existe un empleado con esta cédula en esta empresa');
        }
      }

      Object.assign(empleado, updateEmpleadoDto);
      return await this.empleadoRepository.save(empleado);
    } catch (error) {
      throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const empleado = await this.empleadoRepository.findOne({
        where: { id },
      });

      if (!empleado) {
        throw new Error(`Empleado con ID ${id} no encontrado`);
      }

      await this.empleadoRepository.remove(empleado);
      return { message: 'Empleado eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar empleado: ${error.message}`);
    }
  }
}

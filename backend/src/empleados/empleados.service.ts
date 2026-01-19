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
      const queryBuilder = this.empleadoRepository.createQueryBuilder('empleado');

      // Filtro obligatorio por empresa
      queryBuilder.where('empleado.empresaId = :empresaId', { empresaId: filters.empresaId });

      if (filters.cedula) {
        queryBuilder.andWhere('empleado.cedula ILIKE :cedula', { cedula: `%${filters.cedula}%` });
      }

      if (filters.nombre_completo) {
        queryBuilder.andWhere('empleado.nombre_completo ILIKE :nombre_completo', {
          nombre_completo: `%${filters.nombre_completo}%`,
        });
      }

      if (filters.activo !== undefined && filters.activo !== '') {
        queryBuilder.andWhere('empleado.activo = :activo', { activo: filters.activo === 'true' || filters.activo === true });
      }

      const [data, total] = await queryBuilder
        .orderBy('empleado.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroCostos } from '../entities/centro-costos.entity';
import { CreateCentroCostosDto } from './dto/create-centro-costos.dto';
import { UpdateCentroCostosDto } from './dto/update-centro-costos.dto';

@Injectable()
export class CentroCostosService {
  constructor(
    @InjectRepository(CentroCostos)
    private readonly centroCostosRepository: Repository<CentroCostos>,
  ) { }

  async findAll(empresaId: number) {
    try {
      return await this.centroCostosRepository.find({
        where: { empresaId },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener centros de costos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const centroCostos = await this.centroCostosRepository.findOne({
        where: { id },
      });

      if (!centroCostos) {
        throw new Error(`Centro de costos con ID ${id} no encontrado`);
      }

      return centroCostos;
    } catch (error) {
      throw new Error(`Error al obtener centro de costos: ${error.message}`);
    }
  }

  async create(createCentroCostosDto: CreateCentroCostosDto) {
    try {
      // Verificar duplicados por nombre dentro de la misma empresa
      const existing = await this.centroCostosRepository.findOne({
        where: {
          nombre: createCentroCostosDto.nombre,
          empresaId: createCentroCostosDto.empresaId,
        },
      });

      if (existing) {
        throw new Error('Ya existe un centro de costos con este nombre');
      }

      const centroCostos = this.centroCostosRepository.create(createCentroCostosDto);

      return await this.centroCostosRepository.save(centroCostos);
    } catch (error) {
      throw new Error(`Error al crear centro de costos: ${error.message}`);
    }
  }

  async update(id: number, updateCentroCostosDto: UpdateCentroCostosDto) {
    try {
      const centroCostos = await this.centroCostosRepository.findOne({
        where: { id },
      });

      if (!centroCostos) {
        throw new Error(`Centro de costos con ID ${id} no encontrado`);
      }

      // Verificar duplicados por nombre si se está actualizando
      if (updateCentroCostosDto.nombre && updateCentroCostosDto.nombre !== centroCostos.nombre) {
        const existing = await this.centroCostosRepository.findOne({
          where: {
            nombre: updateCentroCostosDto.nombre,
            empresaId: centroCostos.empresaId,
          },
        });

        if (existing) {
          throw new Error('Ya existe un centro de costos con este nombre');
        }
      }

      // Actualizar solo los campos proporcionados
      Object.assign(centroCostos, updateCentroCostosDto);

      return await this.centroCostosRepository.save(centroCostos);
    } catch (error) {
      throw new Error(`Error al actualizar centro de costos: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const centroCostos = await this.centroCostosRepository.findOne({
        where: { id },
      });

      if (!centroCostos) {
        throw new Error(`Centro de costos con ID ${id} no encontrado`);
      }

      await this.centroCostosRepository.remove(centroCostos);
      return { message: 'Centro de costos eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar centro de costos: ${error.message}`);
    }
  }
}

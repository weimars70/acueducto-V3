import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CentroCostos } from '../entities/centro-costos.entity';
import { CreateCentroCostosDto } from './dto/create-centro-costos.dto';
import { UpdateCentroCostosDto } from './dto/update-centro-costos.dto';

@Injectable()
export class CentroCostosService {
  constructor(
    @InjectRepository(CentroCostos)
    private readonly centroCostosRepository: Repository<CentroCostos>,
    private readonly dataSource: DataSource,
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

  async findOne(codigo: number, empresaId: number) {
    try {
      const centroCostos = await this.centroCostosRepository.findOne({
        where: { codigo, empresaId },
      });

      if (!centroCostos) {
        throw new NotFoundException(`Centro de costos con código ${codigo} no encontrado`);
      }

      return centroCostos;
    } catch (error) {
      throw new Error(`Error al obtener centro de costos: ${error.message}`);
    }
  }

  async create(createCentroCostosDto: CreateCentroCostosDto, userId: number, empresaId: number) {
    try {
      // Obtener nombre del usuario
      const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
      const userName = userData[0]?.name || String(userId);

      // Verificar duplicados por nombre dentro de la misma empresa
      const existing = await this.centroCostosRepository.findOne({
        where: {
          nombre: createCentroCostosDto.nombre,
          empresaId: empresaId,
        },
      });

      if (existing) {
        throw new Error('Ya existe un centro de costos con este nombre');
      }

      const centroCostos = this.centroCostosRepository.create({
        ...createCentroCostosDto,
        empresaId,
        usuario: userName,
      });

      return await this.centroCostosRepository.save(centroCostos);
    } catch (error) {
      throw new Error(`Error al crear centro de costos: ${error.message}`);
    }
  }

  async update(codigo: number, updateCentroCostosDto: UpdateCentroCostosDto, userId: number, empresaId: number) {
    try {
      // Obtener nombre del usuario
      const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
      const userName = userData[0]?.name || String(userId);

      const centroCostos = await this.centroCostosRepository.findOne({
        where: { codigo, empresaId },
      });

      if (!centroCostos) {
        throw new NotFoundException(`Centro de costos con código ${codigo} no encontrado`);
      }

      // Verificar duplicados por nombre si se está actualizando
      if (updateCentroCostosDto.nombre && updateCentroCostosDto.nombre !== centroCostos.nombre) {
        const existing = await this.centroCostosRepository.findOne({
          where: {
            nombre: updateCentroCostosDto.nombre,
            empresaId: empresaId,
          },
        });

        if (existing) {
          throw new Error('Ya existe un centro de costos con este nombre');
        }
      }

      // Actualizar solo los campos proporcionados
      Object.assign(centroCostos, updateCentroCostosDto);
      centroCostos.usuario = userName;

      return await this.centroCostosRepository.save(centroCostos);
    } catch (error) {
      throw new Error(`Error al actualizar centro de costos: ${error.message}`);
    }
  }

  async remove(codigo: number, empresaId: number) {
    try {
      const centroCostos = await this.centroCostosRepository.findOne({
        where: { codigo, empresaId },
      });

      if (!centroCostos) {
        throw new NotFoundException(`Centro de costos con código ${codigo} no encontrado`);
      }

      await this.centroCostosRepository.remove(centroCostos);
      return { message: 'Centro de costos eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar centro de costos: ${error.message}`);
    }
  }
}

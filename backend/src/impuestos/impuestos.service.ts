import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Impuesto } from '../entities/impuesto.entity';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';

@Injectable()
export class ImpuestosService {
  constructor(
    @InjectRepository(Impuesto)
    private readonly impuestoRepository: Repository<Impuesto>,
  ) {}

  async findAll(empresaId: number) {
    try {
      return await this.impuestoRepository.find({
        where: { empresaId },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener impuestos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const impuesto = await this.impuestoRepository.findOne({
        where: { id },
      });

      if (!impuesto) {
        throw new Error(`Impuesto con ID ${id} no encontrado`);
      }

      return impuesto;
    } catch (error) {
      throw new Error(`Error al obtener impuesto: ${error.message}`);
    }
  }

  async create(createImpuestoDto: CreateImpuestoDto) {
    try {
      const existing = await this.impuestoRepository.findOne({
        where: {
          nombre: createImpuestoDto.nombre,
          empresaId: createImpuestoDto.empresa_id,
        },
      });

      if (existing) {
        throw new Error('Ya existe un impuesto con este nombre');
      }

      const impuesto = this.impuestoRepository.create({
        nombre: createImpuestoDto.nombre,
        porcentaje: createImpuestoDto.porcentaje,
        empresaId: createImpuestoDto.empresa_id,
        usuario: createImpuestoDto.usuario,
      });

      return await this.impuestoRepository.save(impuesto);
    } catch (error) {
      throw new Error(`Error al crear impuesto: ${error.message}`);
    }
  }

  async update(id: number, updateImpuestoDto: UpdateImpuestoDto) {
    try {
      const impuesto = await this.impuestoRepository.findOne({
        where: { id },
      });

      if (!impuesto) {
        throw new Error(`Impuesto con ID ${id} no encontrado`);
      }

      if (updateImpuestoDto.nombre && updateImpuestoDto.nombre !== impuesto.nombre) {
        const existing = await this.impuestoRepository.findOne({
          where: {
            nombre: updateImpuestoDto.nombre,
            empresaId: impuesto.empresaId,
          },
        });

        if (existing) {
          throw new Error('Ya existe un impuesto con este nombre');
        }
      }

      if (updateImpuestoDto.nombre) impuesto.nombre = updateImpuestoDto.nombre;
      if (updateImpuestoDto.porcentaje !== undefined) impuesto.porcentaje = updateImpuestoDto.porcentaje;
      if (updateImpuestoDto.usuario) impuesto.usuario = updateImpuestoDto.usuario;

      return await this.impuestoRepository.save(impuesto);
    } catch (error) {
      throw new Error(`Error al actualizar impuesto: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const impuesto = await this.impuestoRepository.findOne({
        where: { id },
      });

      if (!impuesto) {
        throw new Error(`Impuesto con ID ${id} no encontrado`);
      }

      await this.impuestoRepository.remove(impuesto);
      return { message: 'Impuesto eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar impuesto: ${error.message}`);
    }
  }
}

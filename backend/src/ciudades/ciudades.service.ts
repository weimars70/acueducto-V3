import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ciudad } from '../entities/ciudad.entity';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';

@Injectable()
export class CiudadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}

  async findAll(empresaId: number) {
    try {
      return await this.ciudadRepository.find({
        where: { empresaId },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener ciudades: ${error.message}`);
    }
  }

  async findOne(codigo: string) {
    try {
      const ciudad = await this.ciudadRepository.findOne({
        where: { codigo },
      });

      if (!ciudad) {
        throw new Error(`Ciudad con código ${codigo} no encontrada`);
      }

      return ciudad;
    } catch (error) {
      throw new Error(`Error al obtener ciudad: ${error.message}`);
    }
  }

  async create(createCiudadDto: CreateCiudadDto) {
    try {
      // Verificar duplicados por código
      const existing = await this.ciudadRepository.findOne({
        where: {
          codigo: createCiudadDto.codigo,
        },
      });

      if (existing) {
        throw new Error('Ya existe una ciudad con este código');
      }

      const ciudad = this.ciudadRepository.create({
        codigo: createCiudadDto.codigo,
        nombre: createCiudadDto.nombre,
        empresaId: createCiudadDto.empresa_id,
        usuario: createCiudadDto.usuario,
      });

      return await this.ciudadRepository.save(ciudad);
    } catch (error) {
      throw new Error(`Error al crear ciudad: ${error.message}`);
    }
  }

  async update(codigo: string, updateCiudadDto: UpdateCiudadDto) {
    try {
      const ciudad = await this.ciudadRepository.findOne({
        where: { codigo },
      });

      if (!ciudad) {
        throw new Error(`Ciudad con código ${codigo} no encontrada`);
      }

      // Actualizar solo los campos proporcionados
      if (updateCiudadDto.nombre) {
        ciudad.nombre = updateCiudadDto.nombre;
      }
      if (updateCiudadDto.usuario) {
        ciudad.usuario = updateCiudadDto.usuario;
      }

      return await this.ciudadRepository.save(ciudad);
    } catch (error) {
      throw new Error(`Error al actualizar ciudad: ${error.message}`);
    }
  }

  async remove(codigo: string) {
    try {
      const ciudad = await this.ciudadRepository.findOne({
        where: { codigo },
      });

      if (!ciudad) {
        throw new Error(`Ciudad con código ${codigo} no encontrada`);
      }

      await this.ciudadRepository.remove(ciudad);
      return { message: 'Ciudad eliminada exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar ciudad: ${error.message}`);
    }
  }
}

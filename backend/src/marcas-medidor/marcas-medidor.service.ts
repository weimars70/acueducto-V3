import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarcaMedidor } from '../entities/marca-medidor.entity';
import { CreateMarcaMedidorDto } from './dto/create-marca-medidor.dto';
import { UpdateMarcaMedidorDto } from './dto/update-marca-medidor.dto';

@Injectable()
export class MarcasMedidorService {
  constructor(
    @InjectRepository(MarcaMedidor)
    private readonly marcaMedidorRepository: Repository<MarcaMedidor>,
  ) {}

  async findAll(empresaId: number) {
    try {
      return await this.marcaMedidorRepository.find({
        where: { empresaId },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener marcas de medidor: ${error.message}`);
    }
  }

  async findOne(codigo: number) {
    try {
      const marca = await this.marcaMedidorRepository.findOne({
        where: { codigo },
      });

      if (!marca) {
        throw new Error(`Marca de medidor con código ${codigo} no encontrada`);
      }

      return marca;
    } catch (error) {
      throw new Error(`Error al obtener marca de medidor: ${error.message}`);
    }
  }

  async create(createMarcaMedidorDto: CreateMarcaMedidorDto) {
    try {
      const existing = await this.marcaMedidorRepository.findOne({
        where: {
          nombre: createMarcaMedidorDto.nombre,
          empresaId: createMarcaMedidorDto.empresa_id,
        },
      });

      if (existing) {
        throw new Error('Ya existe una marca de medidor con este nombre');
      }

      const marca = this.marcaMedidorRepository.create({
        nombre: createMarcaMedidorDto.nombre,
        empresaId: createMarcaMedidorDto.empresa_id,
        usuario: createMarcaMedidorDto.usuario,
      });

      return await this.marcaMedidorRepository.save(marca);
    } catch (error) {
      throw new Error(`Error al crear marca de medidor: ${error.message}`);
    }
  }

  async update(codigo: number, updateMarcaMedidorDto: UpdateMarcaMedidorDto) {
    try {
      const marca = await this.marcaMedidorRepository.findOne({
        where: { codigo },
      });

      if (!marca) {
        throw new Error(`Marca de medidor con código ${codigo} no encontrada`);
      }

      if (updateMarcaMedidorDto.nombre && updateMarcaMedidorDto.nombre !== marca.nombre) {
        const existing = await this.marcaMedidorRepository.findOne({
          where: {
            nombre: updateMarcaMedidorDto.nombre,
            empresaId: marca.empresaId,
          },
        });

        if (existing) {
          throw new Error('Ya existe una marca de medidor con este nombre');
        }
      }

      if (updateMarcaMedidorDto.nombre) marca.nombre = updateMarcaMedidorDto.nombre;
      if (updateMarcaMedidorDto.usuario) marca.usuario = updateMarcaMedidorDto.usuario;

      return await this.marcaMedidorRepository.save(marca);
    } catch (error) {
      throw new Error(`Error al actualizar marca de medidor: ${error.message}`);
    }
  }

  async remove(codigo: number) {
    try {
      const marca = await this.marcaMedidorRepository.findOne({
        where: { codigo },
      });

      if (!marca) {
        throw new Error(`Marca de medidor con código ${codigo} no encontrada`);
      }

      await this.marcaMedidorRepository.remove(marca);
      return { message: 'Marca de medidor eliminada exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar marca de medidor: ${error.message}`);
    }
  }
}

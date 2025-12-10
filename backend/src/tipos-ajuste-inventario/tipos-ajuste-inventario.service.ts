import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAjusteInventario } from '../entities/tipo-ajuste-inventario.entity';
import { CreateTiposAjusteInventarioDto } from './dto/create-tipos-ajuste-inventario.dto';
import { UpdateTiposAjusteInventarioDto } from './dto/update-tipos-ajuste-inventario.dto';

@Injectable()
export class TiposAjusteInventarioService {
  constructor(
    @InjectRepository(TipoAjusteInventario)
    private readonly tipoAjusteRepository: Repository<TipoAjusteInventario>,
  ) { }

  async create(createDto: CreateTiposAjusteInventarioDto): Promise<TipoAjusteInventario> {
    // Validar que solo uno de los booleanos sea true
    const trueCount = [createDto.sumaUnidades, createDto.restaUnidades, createDto.valorUnidades]
      .filter(val => val === true).length;

    if (trueCount !== 1) {
      throw new BadRequestException('Exactamente uno de los campos (sumaUnidades, restaUnidades, valorUnidades) debe ser true');
    }

    // Verificar si ya existe un tipo con ese nombre
    const existente = await this.tipoAjusteRepository.findOne({
      where: { nombre: createDto.nombre }
    });

    if (existente) {
      throw new BadRequestException('Ya existe un tipo de ajuste con ese nombre');
    }

    const tipoAjuste = this.tipoAjusteRepository.create(createDto);
    return await this.tipoAjusteRepository.save(tipoAjuste);
  }

  async findAll(): Promise<TipoAjusteInventario[]> {
    return await this.tipoAjusteRepository.find({
      order: { codigo: 'ASC' }
    });
  }

  async findActivos(): Promise<TipoAjusteInventario[]> {
    return await this.tipoAjusteRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }

  async findOne(codigo: number): Promise<TipoAjusteInventario> {
    const tipoAjuste = await this.tipoAjusteRepository.findOne({
      where: { codigo }
    });

    if (!tipoAjuste) {
      throw new NotFoundException(`Tipo de ajuste con código ${codigo} no encontrado`);
    }

    return tipoAjuste;
  }

  async update(codigo: number, updateDto: UpdateTiposAjusteInventarioDto): Promise<TipoAjusteInventario> {
    const tipoAjuste = await this.findOne(codigo);

    // Si se están actualizando los booleanos, validar que solo uno sea true
    const sumaUnidades = updateDto.sumaUnidades ?? tipoAjuste.sumaUnidades;
    const restaUnidades = updateDto.restaUnidades ?? tipoAjuste.restaUnidades;
    const valorUnidades = updateDto.valorUnidades ?? tipoAjuste.valorUnidades;

    const trueCount = [sumaUnidades, restaUnidades, valorUnidades]
      .filter(val => val === true).length;

    if (trueCount !== 1) {
      throw new BadRequestException('Exactamente uno de los campos (sumaUnidades, restaUnidades, valorUnidades) debe ser true');
    }

    // Verificar nombre duplicado si se está actualizando
    if (updateDto.nombre && updateDto.nombre !== tipoAjuste.nombre) {
      const existente = await this.tipoAjusteRepository.findOne({
        where: { nombre: updateDto.nombre }
      });

      if (existente) {
        throw new BadRequestException('Ya existe un tipo de ajuste con ese nombre');
      }
    }

    Object.assign(tipoAjuste, updateDto);
    return await this.tipoAjusteRepository.save(tipoAjuste);
  }

  async remove(codigo: number): Promise<void> {
    const tipoAjuste = await this.findOne(codigo);
    await this.tipoAjusteRepository.remove(tipoAjuste);
  }
}

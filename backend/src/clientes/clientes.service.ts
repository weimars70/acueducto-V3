import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(empresaId: number) {
    try {
      return await this.clienteRepository.find({
        where: { empresaId },
        order: { nombres: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  async findOne(codigo: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { codigo },
      });

      if (!cliente) {
        throw new Error(`Cliente con código ${codigo} no encontrado`);
      }

      return cliente;
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }
  }

  async create(createClienteDto: CreateClienteDto) {
    try {
      const cliente = this.clienteRepository.create({
        ...createClienteDto,
        empresaId: createClienteDto.empresa_id,
      });

      return await this.clienteRepository.save(cliente);
    } catch (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  async update(codigo: number, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { codigo },
      });

      if (!cliente) {
        throw new Error(`Cliente con código ${codigo} no encontrado`);
      }

      Object.assign(cliente, updateClienteDto);
      if (updateClienteDto.empresa_id) {
        cliente.empresaId = updateClienteDto.empresa_id;
      }

      return await this.clienteRepository.save(cliente);
    } catch (error) {
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  async remove(codigo: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { codigo },
      });

      if (!cliente) {
        throw new Error(`Cliente con código ${codigo} no encontrado`);
      }

      await this.clienteRepository.remove(cliente);
      return { message: 'Cliente eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }
}

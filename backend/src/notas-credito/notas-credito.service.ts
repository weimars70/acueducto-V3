import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotasCreditoDto } from './dto/create-notas-credito.dto';
import { UpdateNotasCreditoDto } from './dto/update-notas-credito.dto';
import { NotaCredito } from '../entities/nota-credito.entity';

@Injectable()
export class NotasCreditoService {
  constructor(
    @InjectRepository(NotaCredito)
    private readonly notaCreditoRepository: Repository<NotaCredito>,
  ) {}

  async create(createNotasCreditoDto: CreateNotasCreditoDto): Promise<NotaCredito> {
    const notaCredito = this.notaCreditoRepository.create(createNotasCreditoDto);
    return await this.notaCreditoRepository.save(notaCredito);
  }

  async findAll(empresaId?: number): Promise<NotaCredito[]> {
    if (empresaId) {
      return await this.notaCreditoRepository.find({
        where: { empresaId },
        order: { codigo: 'DESC' },
      });
    }
    return await this.notaCreditoRepository.find({
      order: { codigo: 'DESC' },
    });
  }

  async findOne(codigo: number, empresaId: number): Promise<NotaCredito> {
    const notaCredito = await this.notaCreditoRepository.findOne({
      where: { codigo, empresaId },
    });

    if (!notaCredito) {
      throw new NotFoundException(`Nota de crédito #${codigo} no encontrada`);
    }

    return notaCredito;
  }

  async update(
    codigo: number,
    empresaId: number,
    updateNotasCreditoDto: UpdateNotasCreditoDto,
  ): Promise<NotaCredito> {
    const notaCredito = await this.findOne(codigo, empresaId);
    Object.assign(notaCredito, updateNotasCreditoDto);
    return await this.notaCreditoRepository.save(notaCredito);
  }

  async remove(codigo: number, empresaId: number): Promise<void> {
    const notaCredito = await this.findOne(codigo, empresaId);
    await this.notaCreditoRepository.remove(notaCredito);
  }
}

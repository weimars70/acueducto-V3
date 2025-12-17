import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaConcepto } from '../entities/nota-concepto.entity';
import { CreateNotasConceptoDto } from './dto/create-notas-concepto.dto';
import { UpdateNotasConceptoDto } from './dto/update-notas-concepto.dto';

@Injectable()
export class NotasConceptosService {
  constructor(
    @InjectRepository(NotaConcepto)
    private readonly notaConceptoRepository: Repository<NotaConcepto>,
  ) {}

  async create(createDto: CreateNotasConceptoDto): Promise<NotaConcepto> {
    const concepto = this.notaConceptoRepository.create(createDto);
    return await this.notaConceptoRepository.save(concepto);
  }

  async findAll(empresaId: number): Promise<NotaConcepto[]> {
    return await this.notaConceptoRepository.find({
      where: { empresaId },
      order: { descripcion: 'ASC' },
    });
  }

  async findOne(codigo: number, empresaId: number): Promise<NotaConcepto> {
    const concepto = await this.notaConceptoRepository.findOne({
      where: { codigo, empresaId },
    });
    if (!concepto) {
      throw new NotFoundException(
        `Nota concepto con código ${codigo} no encontrado`,
      );
    }
    return concepto;
  }

  async update(
    codigo: number,
    updateDto: UpdateNotasConceptoDto,
    empresaId: number,
  ): Promise<NotaConcepto> {
    await this.findOne(codigo, empresaId);
    await this.notaConceptoRepository.update({ codigo, empresaId }, updateDto);
    return await this.findOne(codigo, empresaId);
  }

  async remove(codigo: number, empresaId: number): Promise<void> {
    const concepto = await this.findOne(codigo, empresaId);
    await this.notaConceptoRepository.remove(concepto);
  }
}

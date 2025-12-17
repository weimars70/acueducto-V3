import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaDebitoConcepto } from './entities/nota-debito-concepto.entity';
import { CreateNotaDebitoConceptoDto } from './dto/create-nota-debito-concepto.dto';
import { UpdateNotaDebitoConceptoDto } from './dto/update-nota-debito-concepto.dto';

@Injectable()
export class NotasDebitoConceptosService {
    constructor(
        @InjectRepository(NotaDebitoConcepto)
        private readonly notaDebitoConceptoRepository: Repository<NotaDebitoConcepto>,
    ) { }

    async create(createDto: CreateNotaDebitoConceptoDto): Promise<NotaDebitoConcepto> {
        const concepto = this.notaDebitoConceptoRepository.create(createDto);
        return await this.notaDebitoConceptoRepository.save(concepto);
    }

    async findAll(empresaId: number): Promise<NotaDebitoConcepto[]> {
        return await this.notaDebitoConceptoRepository.find({
            where: { empresaId },
            order: { descripcion: 'ASC' },
        });
    }

    async findOne(codigo: number, empresaId: number): Promise<NotaDebitoConcepto> {
        const concepto = await this.notaDebitoConceptoRepository.findOne({
            where: { codigo, empresaId },
        });
        if (!concepto) {
            throw new NotFoundException(
                `Nota debito concepto con código ${codigo} no encontrado`,
            );
        }
        return concepto;
    }

    async update(
        codigo: number,
        updateDto: UpdateNotaDebitoConceptoDto,
        empresaId: number,
    ): Promise<NotaDebitoConcepto> {
        await this.findOne(codigo, empresaId);
        await this.notaDebitoConceptoRepository.update({ codigo, empresaId }, updateDto);
        return await this.findOne(codigo, empresaId);
    }

    async remove(codigo: number, empresaId: number): Promise<void> {
        const concepto = await this.findOne(codigo, empresaId);
        await this.notaDebitoConceptoRepository.remove(concepto);
    }
}

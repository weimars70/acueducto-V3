import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotaDebitoDto } from './dto/create-nota-debito.dto';
import { UpdateNotaDebitoDto } from './dto/update-nota-debito.dto';
import { NotaDebito } from './entities/nota-debito.entity';

@Injectable()
export class NotasDebitoService {
    constructor(
        @InjectRepository(NotaDebito)
        private readonly notaDebitoRepository: Repository<NotaDebito>,
    ) { }

    async create(createNotaDebitoDto: CreateNotaDebitoDto): Promise<NotaDebito> {
        const notaDebito = this.notaDebitoRepository.create(createNotaDebitoDto);
        return await this.notaDebitoRepository.save(notaDebito);
    }

    async findAll(empresaId?: number): Promise<NotaDebito[]> {
        if (empresaId) {
            return await this.notaDebitoRepository.find({
                where: { empresaId },
                order: { codigo: 'DESC' },
            });
        }
        return await this.notaDebitoRepository.find({
            order: { codigo: 'DESC' },
        });
    }

    async findOne(codigo: number, empresaId: number): Promise<NotaDebito> {
        const notaDebito = await this.notaDebitoRepository.findOne({
            where: { codigo, empresaId },
        });

        if (!notaDebito) {
            throw new NotFoundException(`Nota de débito #${codigo} no encontrada`);
        }

        return notaDebito;
    }

    async update(
        codigo: number,
        empresaId: number,
        updateNotaDebitoDto: UpdateNotaDebitoDto,
    ): Promise<NotaDebito> {
        const notaDebito = await this.findOne(codigo, empresaId);
        Object.assign(notaDebito, updateNotaDebitoDto);
        return await this.notaDebitoRepository.save(notaDebito);
    }

    async remove(codigo: number, empresaId: number): Promise<void> {
        const notaDebito = await this.findOne(codigo, empresaId);
        await this.notaDebitoRepository.remove(notaDebito);
    }
}

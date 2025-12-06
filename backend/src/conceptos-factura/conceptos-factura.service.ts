import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConceptoFactura } from '../entities/concepto-factura.entity';
import { CreateConceptoFacturaDto } from './dto/create-concepto-factura.dto';
import { UpdateConceptoFacturaDto } from './dto/update-concepto-factura.dto';

@Injectable()
export class ConceptosFacturaService {
    constructor(
        @InjectRepository(ConceptoFactura)
        private readonly conceptoRepository: Repository<ConceptoFactura>,
    ) { }

    async create(createDto: CreateConceptoFacturaDto): Promise<ConceptoFactura> {
        const concepto = this.conceptoRepository.create(createDto);
        return await this.conceptoRepository.save(concepto);
    }

    async findAll(empresaId?: number): Promise<ConceptoFactura[]> {
        const query = this.conceptoRepository.createQueryBuilder('concepto')
            .where('concepto.activo = :activo', { activo: true });

        if (empresaId) {
            query.andWhere('concepto.empresaId = :empresaId', { empresaId });
        }

        query.orderBy('concepto.nombre', 'ASC');

        return await query.getMany();
    }

    async findOne(codigo: number): Promise<ConceptoFactura> {
        const concepto = await this.conceptoRepository.findOne({ where: { codigo } });
        if (!concepto) {
            throw new NotFoundException(`Concepto factura con codigo ${codigo} no encontrado`);
        }
        return concepto;
    }

    async update(codigo: number, updateDto: UpdateConceptoFacturaDto): Promise<ConceptoFactura> {
        const concepto = await this.findOne(codigo);
        const updated = Object.assign(concepto, updateDto);
        return await this.conceptoRepository.save(updated);
    }

    async remove(codigo: number): Promise<void> {
        const concepto = await this.findOne(codigo);
        concepto.activo = false; // Soft delete
        await this.conceptoRepository.save(concepto);
    }
}

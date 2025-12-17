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

    async findAll(empresaId: number): Promise<ConceptoFactura[]> {
        return await this.conceptoRepository.find({
            where: {
                empresaId
            },
            order: {
                nombre: 'ASC'
            }
        });
    }

    async findOne(codigo: number, empresaId: number): Promise<ConceptoFactura> {
        const concepto = await this.conceptoRepository.findOne({
            where: { codigo, empresaId }
        });
        if (!concepto) {
            throw new NotFoundException(`Concepto factura con codigo ${codigo} no encontrado`);
        }
        return concepto;
    }

    async update(codigo: number, updateDto: UpdateConceptoFacturaDto, empresaId: number): Promise<ConceptoFactura> {
        // Primero verificar que existe y pertenece a la empresa
        await this.findOne(codigo, empresaId);

        // Actualizar usando el método update nativo de TypeORM
        await this.conceptoRepository.update(
            { codigo, empresaId },
            updateDto
        );

        // Retornar el registro actualizado
        return await this.findOne(codigo, empresaId);
    }

    async remove(codigo: number, empresaId: number): Promise<void> {
        const concepto = await this.findOne(codigo, empresaId);
        concepto.activo = false; // Soft delete
        await this.conceptoRepository.save(concepto);
    }
}

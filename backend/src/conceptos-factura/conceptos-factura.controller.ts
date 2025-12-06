import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ConceptosFacturaService } from './conceptos-factura.service';
import { CreateConceptoFacturaDto } from './dto/create-concepto-factura.dto';
import { UpdateConceptoFacturaDto } from './dto/update-concepto-factura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conceptos-factura')
@UseGuards(JwtAuthGuard)
export class ConceptosFacturaController {
    constructor(private readonly service: ConceptosFacturaService) { }

    @Post()
    create(@Body() createDto: CreateConceptoFacturaDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll(@Query('empresaId') empresaId?: number) {
        return this.service.findAll(empresaId ? +empresaId : undefined);
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string) {
        return this.service.findOne(+codigo);
    }

    @Patch(':codigo')
    update(@Param('codigo') codigo: string, @Body() updateDto: UpdateConceptoFacturaDto) {
        return this.service.update(+codigo, updateDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.service.remove(+codigo);
    }
}

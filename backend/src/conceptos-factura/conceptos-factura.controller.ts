import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ConceptosFacturaService } from './conceptos-factura.service';
import { CreateConceptoFacturaDto } from './dto/create-concepto-factura.dto';
import { UpdateConceptoFacturaDto } from './dto/update-concepto-factura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conceptos-factura')
@UseGuards(JwtAuthGuard)
export class ConceptosFacturaController {
    constructor(private readonly service: ConceptosFacturaService) { }

    @Post()
    create(@Body() createDto: CreateConceptoFacturaDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        const usuarioEmail = req.user.email;
        return this.service.create({ ...createDto, empresaId, usuario: usuarioEmail });
    }

    @Get()
    findAll(@Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.findAll(empresaId);
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string, @Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.findOne(+codigo, empresaId);
    }

    @Patch(':codigo')
    update(@Param('codigo') codigo: string, @Body() updateDto: UpdateConceptoFacturaDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.update(+codigo, updateDto, empresaId);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string, @Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.remove(+codigo, empresaId);
    }
}

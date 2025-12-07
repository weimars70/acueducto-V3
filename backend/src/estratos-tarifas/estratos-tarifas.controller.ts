import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstratosTarifasService } from './estratos-tarifas.service';
import { CreateEstratoTarifaDto } from './dto/create-estrato-tarifa.dto';
import { UpdateEstratoTarifaDto } from './dto/update-estrato-tarifa.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('estratos-tarifas')
@Controller('estratos-tarifas')
export class EstratosTarifasController {
    constructor(private readonly service: EstratosTarifasService) { }

    @Post()
    create(@Body() createDto: CreateEstratoTarifaDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll(@Query('empresaId') empresaId?: number) {
        return this.service.findAll(empresaId);
    }

    @Get(':codigo/:tipo')
    findOne(@Param('codigo') codigo: string, @Param('tipo') tipo: string) {
        return this.service.findOne(+codigo, +tipo);
    }

    @Patch(':codigo/:tipo')
    update(@Param('codigo') codigo: string, @Param('tipo') tipo: string, @Body() updateDto: UpdateEstratoTarifaDto) {
        return this.service.update(+codigo, +tipo, updateDto);
    }

    @Delete(':codigo/:tipo')
    remove(@Param('codigo') codigo: string, @Param('tipo') tipo: string) {
        return this.service.remove(+codigo, +tipo);
    }
}

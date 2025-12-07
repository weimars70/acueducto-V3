import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstratosService } from './estratos.service';
import { CreateEstratoDto } from './dto/create-estrato.dto';
import { UpdateEstratoDto } from './dto/update-estrato.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('estratos')
@Controller('estratos')
export class EstratosController {
    constructor(private readonly service: EstratosService) { }

    @Post()
    create(@Body() createDto: CreateEstratoDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll(@Query('empresaId') empresaId?: number) {
        return this.service.findAll(empresaId);
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string) {
        return this.service.findOne(+codigo);
    }

    @Patch(':codigo')
    update(@Param('codigo') codigo: string, @Body() updateDto: UpdateEstratoDto) {
        return this.service.update(+codigo, updateDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.service.remove(+codigo);
    }
}

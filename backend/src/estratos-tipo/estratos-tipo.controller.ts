import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstratosTipoService } from './estratos-tipo.service';
import { CreateEstratoTipoDto } from './dto/create-estrato-tipo.dto';
import { UpdateEstratoTipoDto } from './dto/update-estrato-tipo.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('estratos-tipo')
@Controller('estratos-tipo')
export class EstratosTipoController {
    constructor(private readonly service: EstratosTipoService) { }

    @Post()
    create(@Body() createDto: CreateEstratoTipoDto) {
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
    update(@Param('codigo') codigo: string, @Body() updateDto: UpdateEstratoTipoDto) {
        return this.service.update(+codigo, updateDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.service.remove(+codigo);
    }
}

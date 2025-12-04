import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TipoPersonaService } from './tipo-persona.service';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-persona')
@UseGuards(JwtAuthGuard)
export class TipoPersonaController {
    constructor(private readonly tipoPersonaService: TipoPersonaService) { }

    @Post()
    create(@Body() createTipoPersonaDto: CreateTipoPersonaDto) {
        return this.tipoPersonaService.create(createTipoPersonaDto);
    }

    @Get()
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('nombre') nombre?: string,
    ) {
        return this.tipoPersonaService.findAll(page, limit, { nombre });
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string) {
        return this.tipoPersonaService.findOne(+codigo);
    }

    @Put(':codigo')
    update(@Param('codigo') codigo: string, @Body() updateTipoPersonaDto: UpdateTipoPersonaDto) {
        return this.tipoPersonaService.update(+codigo, updateTipoPersonaDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.tipoPersonaService.remove(+codigo);
    }
}

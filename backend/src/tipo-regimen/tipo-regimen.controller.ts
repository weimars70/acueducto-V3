import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TipoRegimenService } from './tipo-regimen.service';
import { CreateTipoRegimenDto } from './dto/create-tipo-regimen.dto';
import { UpdateTipoRegimenDto } from './dto/update-tipo-regimen.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-regimen')
@UseGuards(JwtAuthGuard)
export class TipoRegimenController {
    constructor(private readonly tipoRegimenService: TipoRegimenService) { }

    @Post()
    create(@Body() createTipoRegimenDto: CreateTipoRegimenDto) {
        return this.tipoRegimenService.create(createTipoRegimenDto);
    }

    @Get()
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('nombre') nombre?: string,
    ) {
        return this.tipoRegimenService.findAll(page, limit, { nombre });
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string) {
        return this.tipoRegimenService.findOne(+codigo);
    }

    @Put(':codigo')
    update(@Param('codigo') codigo: string, @Body() updateTipoRegimenDto: UpdateTipoRegimenDto) {
        return this.tipoRegimenService.update(+codigo, updateTipoRegimenDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.tipoRegimenService.remove(+codigo);
    }
}

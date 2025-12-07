import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TipoPersonaService } from './tipo-persona.service';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-persona')
@UseGuards(JwtAuthGuard)
export class TipoPersonaController {
    constructor(private readonly tipoPersonaService: TipoPersonaService) { }

    @Post()
    create(@Body() createTipoPersonaDto: CreateTipoPersonaDto, @Req() req) {
        return this.tipoPersonaService.create(
            createTipoPersonaDto,
            req.user.empresaId,
            req.user.userId
        );
    }

    @Get()
    findAll(@Req() req) {
        return this.tipoPersonaService.findAll(req.user.empresaId);
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string, @Req() req) {
        return this.tipoPersonaService.findOne(+codigo, req.user.empresaId);
    }

    @Put(':codigo')
    update(
        @Param('codigo') codigo: string,
        @Body() updateTipoPersonaDto: UpdateTipoPersonaDto,
        @Req() req
    ) {
        return this.tipoPersonaService.update(
            +codigo,
            updateTipoPersonaDto,
            req.user.empresaId,
            req.user.userId
        );
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string, @Req() req) {
        return this.tipoPersonaService.remove(+codigo, req.user.empresaId);
    }
}

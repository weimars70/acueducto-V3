import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DiferidosService } from './diferidos.service';
import { CreateDiferidoDto } from './dto/create-diferido.dto';
import { UpdateDiferidoDto } from './dto/update-diferido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('diferidos')
@UseGuards(JwtAuthGuard)
export class DiferidosController {
    constructor(private readonly service: DiferidosService) { }

    @Post()
    create(@Body() createDto: CreateDiferidoDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll(@Query('empresaId') empresaId?: number) {
        return this.service.findAll(empresaId ? +empresaId : undefined);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateDiferidoDto) {
        return this.service.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}

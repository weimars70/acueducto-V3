import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TiposAjusteInventarioService } from './tipos-ajuste-inventario.service';
import { CreateTiposAjusteInventarioDto } from './dto/create-tipos-ajuste-inventario.dto';
import { UpdateTiposAjusteInventarioDto } from './dto/update-tipos-ajuste-inventario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipos-ajuste-inventario')
@UseGuards(JwtAuthGuard)
export class TiposAjusteInventarioController {
  constructor(private readonly tiposAjusteInventarioService: TiposAjusteInventarioService) { }

  @Post()
  create(@Body() createDto: CreateTiposAjusteInventarioDto) {
    return this.tiposAjusteInventarioService.create(createDto);
  }

  @Get()
  findAll() {
    return this.tiposAjusteInventarioService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.tiposAjusteInventarioService.findActivos();
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.tiposAjusteInventarioService.findOne(+codigo);
  }

  @Patch(':codigo')
  update(
    @Param('codigo') codigo: string,
    @Body() updateDto: UpdateTiposAjusteInventarioDto
  ) {
    return this.tiposAjusteInventarioService.update(+codigo, updateDto);
  }

  @Delete(':codigo')
  remove(@Param('codigo') codigo: string) {
    return this.tiposAjusteInventarioService.remove(+codigo);
  }
}

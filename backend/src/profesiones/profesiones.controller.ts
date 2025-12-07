import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProfesionesService } from './profesiones.service';
import { CreateProfesionDto } from './dto/create-profesion.dto';
import { UpdateProfesionDto } from './dto/update-profesion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profesiones')
@UseGuards(JwtAuthGuard)
export class ProfesionesController {
  constructor(private readonly profesionesService: ProfesionesService) { }

  @Post()
  create(@Body() createProfesionDto: CreateProfesionDto, @Req() req) {
    return this.profesionesService.create(createProfesionDto, req.user.userId, req.user.empresaId);
  }

  @Get()
  findAll(@Req() req) {
    return this.profesionesService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.profesionesService.findOne(+id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfesionDto: UpdateProfesionDto, @Req() req) {
    return this.profesionesService.update(+id, updateProfesionDto, req.user.userId, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.profesionesService.remove(+id, req.user.empresaId);
  }
}

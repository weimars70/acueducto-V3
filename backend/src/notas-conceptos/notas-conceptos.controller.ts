import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotasConceptosService } from './notas-conceptos.service';
import { CreateNotasConceptoDto } from './dto/create-notas-concepto.dto';
import { UpdateNotasConceptoDto } from './dto/update-notas-concepto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notas-conceptos')
@UseGuards(JwtAuthGuard)
export class NotasConceptosController {
  constructor(private readonly service: NotasConceptosService) {}

  @Post()
  create(@Body() createDto: CreateNotasConceptoDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const usuarioEmail = req.user.email;
    return this.service.create({
      ...createDto,
      empresaId,
      usuario: usuarioEmail,
    });
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
  update(
    @Param('codigo') codigo: string,
    @Body() updateDto: UpdateNotasConceptoDto,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.service.update(+codigo, updateDto, empresaId);
  }

  @Delete(':codigo')
  remove(@Param('codigo') codigo: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.service.remove(+codigo, empresaId);
  }
}

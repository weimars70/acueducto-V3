import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { NotasCreditoService } from './notas-credito.service';
import { CreateNotasCreditoDto } from './dto/create-notas-credito.dto';
import { UpdateNotasCreditoDto } from './dto/update-notas-credito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notas-credito')
@UseGuards(JwtAuthGuard)
export class NotasCreditoController {
  constructor(private readonly notasCreditoService: NotasCreditoService) {}

  @Post()
  create(@Body() createNotasCreditoDto: CreateNotasCreditoDto) {
    return this.notasCreditoService.create(createNotasCreditoDto);
  }

  @Get()
  findAll(@Query('empresaId') empresaId?: string) {
    return this.notasCreditoService.findAll(empresaId ? +empresaId : undefined);
  }

  @Get(':codigo/:empresaId')
  findOne(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return this.notasCreditoService.findOne(codigo, empresaId);
  }

  @Patch(':codigo/:empresaId')
  update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() updateNotasCreditoDto: UpdateNotasCreditoDto,
  ) {
    return this.notasCreditoService.update(codigo, empresaId, updateNotasCreditoDto);
  }

  @Delete(':codigo/:empresaId')
  remove(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return this.notasCreditoService.remove(codigo, empresaId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ImpuestosService } from './impuestos.service';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('impuestos')
@UseGuards(JwtAuthGuard)
export class ImpuestosController {
  constructor(private readonly impuestosService: ImpuestosService) { }

  @Get()
  async findAll(@Req() req) {
    return this.impuestosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.impuestosService.findOne(parseInt(id, 10));
  }

  @Post()
  async create(@Body() createImpuestoDto: CreateImpuestoDto, @Req() req) {
    createImpuestoDto.empresa_id = req.user.empresaId;
    createImpuestoDto.usuario = req.user.email || String(req.user.userId);
    return this.impuestosService.create(createImpuestoDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImpuestoDto: UpdateImpuestoDto,
    @Req() req,
  ) {
    updateImpuestoDto.usuario = req.user.email || String(req.user.userId);
    return this.impuestosService.update(parseInt(id, 10), updateImpuestoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.impuestosService.remove(parseInt(id, 10));
  }
}

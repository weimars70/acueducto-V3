import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ImpuestosService } from './impuestos.service';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('impuestos')
export class ImpuestosController {
  constructor(private readonly impuestosService: ImpuestosService) {}

  @Get()
  async findAll(@Query('empresaId') empresaId: string) {
    return this.impuestosService.findAll(parseInt(empresaId, 10));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.impuestosService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createImpuestoDto: CreateImpuestoDto) {
    return this.impuestosService.create(createImpuestoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateImpuestoDto: UpdateImpuestoDto,
  ) {
    return this.impuestosService.update(parseInt(id, 10), updateImpuestoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.impuestosService.remove(parseInt(id, 10));
  }
}

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
import { CiudadesService } from './ciudades.service';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Get()
  async findAll(@Query('empresaId') empresaId: string) {
    return this.ciudadesService.findAll(parseInt(empresaId, 10));
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: string) {
    return this.ciudadesService.findOne(codigo);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCiudadDto: CreateCiudadDto) {
    return this.ciudadesService.create(createCiudadDto);
  }

  @Put(':codigo')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('codigo') codigo: string,
    @Body() updateCiudadDto: UpdateCiudadDto,
  ) {
    return this.ciudadesService.update(codigo, updateCiudadDto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('codigo') codigo: string) {
    return this.ciudadesService.remove(codigo);
  }
}

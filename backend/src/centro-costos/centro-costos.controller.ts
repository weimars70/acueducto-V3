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
import { CentroCostosService } from './centro-costos.service';
import { CreateCentroCostosDto } from './dto/create-centro-costos.dto';
import { UpdateCentroCostosDto } from './dto/update-centro-costos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('centro-costos')
export class CentroCostosController {
  constructor(private readonly centroCostosService: CentroCostosService) {}

  @Get()
  async findAll(@Query('empresaId') empresaId: string) {
    return this.centroCostosService.findAll(parseInt(empresaId, 10));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.centroCostosService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCentroCostosDto: CreateCentroCostosDto) {
    return this.centroCostosService.create(createCentroCostosDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCentroCostosDto: UpdateCentroCostosDto,
  ) {
    return this.centroCostosService.update(parseInt(id, 10), updateCentroCostosDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.centroCostosService.remove(parseInt(id, 10));
  }
}

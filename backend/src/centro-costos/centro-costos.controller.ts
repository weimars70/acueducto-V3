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
import { CentroCostosService } from './centro-costos.service';
import { CreateCentroCostosDto } from './dto/create-centro-costos.dto';
import { UpdateCentroCostosDto } from './dto/update-centro-costos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('centro-costos')
@UseGuards(JwtAuthGuard)
export class CentroCostosController {
  constructor(private readonly centroCostosService: CentroCostosService) { }

  @Get()
  async findAll(@Req() req) {
    return this.centroCostosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.centroCostosService.findOne(parseInt(id, 10), req.user.empresaId);
  }

  @Post()
  async create(@Body() createCentroCostosDto: CreateCentroCostosDto, @Req() req) {
    return this.centroCostosService.create(createCentroCostosDto, req.user.userId, req.user.empresaId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCentroCostosDto: UpdateCentroCostosDto,
    @Req() req,
  ) {
    return this.centroCostosService.update(parseInt(id, 10), updateCentroCostosDto, req.user.userId, req.user.empresaId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.centroCostosService.remove(parseInt(id, 10), req.user.empresaId);
  }
}

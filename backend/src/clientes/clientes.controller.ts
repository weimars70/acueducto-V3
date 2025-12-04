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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async findAll(@Query('empresaId') empresaId: string) {
    return this.clientesService.findAll(parseInt(empresaId, 10));
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: string) {
    return this.clientesService.findOne(parseInt(codigo, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Put(':codigo')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('codigo') codigo: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(parseInt(codigo, 10), updateClienteDto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('codigo') codigo: string) {
    return this.clientesService.remove(parseInt(codigo, 10));
  }
}

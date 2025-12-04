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
import { MarcasMedidorService } from './marcas-medidor.service';
import { CreateMarcaMedidorDto } from './dto/create-marca-medidor.dto';
import { UpdateMarcaMedidorDto } from './dto/update-marca-medidor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('marcas-medidor')
export class MarcasMedidorController {
  constructor(private readonly marcasMedidorService: MarcasMedidorService) {}

  @Get()
  async findAll(@Query('empresaId') empresaId: string) {
    return this.marcasMedidorService.findAll(parseInt(empresaId, 10));
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: string) {
    return this.marcasMedidorService.findOne(parseInt(codigo, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createMarcaMedidorDto: CreateMarcaMedidorDto) {
    return this.marcasMedidorService.create(createMarcaMedidorDto);
  }

  @Put(':codigo')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('codigo') codigo: string,
    @Body() updateMarcaMedidorDto: UpdateMarcaMedidorDto,
  ) {
    return this.marcasMedidorService.update(parseInt(codigo, 10), updateMarcaMedidorDto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('codigo') codigo: string) {
    return this.marcasMedidorService.remove(parseInt(codigo, 10));
  }
}

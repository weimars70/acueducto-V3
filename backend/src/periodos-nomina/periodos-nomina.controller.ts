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
  Request,
} from '@nestjs/common';
import { PeriodosNominaService } from './periodos-nomina.service';
import { CreatePeriodoNominaDto } from './dto/create-periodo-nomina.dto';
import { UpdatePeriodoNominaDto } from './dto/update-periodo-nomina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('periodos-nomina')
@UseGuards(JwtAuthGuard)
export class PeriodosNominaController {
  constructor(private readonly periodosService: PeriodosNominaService) { }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Record<string, any>,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.periodosService.findAll(page, limit, { ...filters, empresaId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodosService.findOne(+id);
  }

  @Post()
  create(@Body() createPeriodoDto: CreatePeriodoNominaDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const userId = req.user.userId;
    return this.periodosService.create({
      ...createPeriodoDto,
      empresaId,
      usuario_creacion: userId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeriodoDto: UpdatePeriodoNominaDto,
  ) {
    return this.periodosService.update(+id, updatePeriodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodosService.remove(+id);
  }

  @Put(':id/cerrar')
  cerrar(@Param('id') id: string) {
    return this.periodosService.cerrarPeriodo(+id);
  }

  @Put(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.periodosService.marcarComoPagado(+id);
  }
}

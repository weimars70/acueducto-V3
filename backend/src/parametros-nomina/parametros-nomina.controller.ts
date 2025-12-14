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
import { ParametrosNominaService } from './parametros-nomina.service';
import { CreateParametroNominaDto } from './dto/create-parametro-nomina.dto';
import { UpdateParametroNominaDto } from './dto/update-parametro-nomina.dto';
import { DuplicateYearDto } from './dto/duplicate-year.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('parametros-nomina')
@UseGuards(JwtAuthGuard)
export class ParametrosNominaController {
  constructor(private readonly parametrosService: ParametrosNominaService) { }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Record<string, any>,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.parametrosService.findAll(page, limit, { ...filters, empresaId });
  }

  @Get('years')
  async getYears(@Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.parametrosService.getDistinctYears(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametrosService.findOne(+id);
  }

  @Post()
  create(@Body() createParametroDto: CreateParametroNominaDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const usuarioId = req.user.userId;
    return this.parametrosService.create({
      ...createParametroDto,
      empresaId,
      usuarioCreacion: usuarioId,
    });
  }

  @Post('duplicate-year')
  duplicateYear(@Body() duplicateDto: DuplicateYearDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const usuarioId = req.user.userId;
    return this.parametrosService.duplicateYear(duplicateDto, empresaId, usuarioId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateParametroDto: UpdateParametroNominaDto,
  ) {
    return this.parametrosService.update(+id, updateParametroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametrosService.remove(+id);
  }
}

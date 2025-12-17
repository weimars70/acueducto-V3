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
import { ConceptosNominaService } from './conceptos-nomina.service';
import { CreateConceptoNominaDto } from './dto/create-concepto-nomina.dto';
import { UpdateConceptoNominaDto } from './dto/update-concepto-nomina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conceptos-nomina')
@UseGuards(JwtAuthGuard)
export class ConceptosNominaController {
  constructor(private readonly conceptosService: ConceptosNominaService) { }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Record<string, any>,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.conceptosService.findAll(page, limit, { ...filters, empresaId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptosService.findOne(+id);
  }

  @Post()
  create(@Body() createConceptoDto: CreateConceptoNominaDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.conceptosService.create({
      ...createConceptoDto,
      empresaId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateConceptoDto: UpdateConceptoNominaDto,
  ) {
    return this.conceptosService.update(+id, updateConceptoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptosService.remove(+id);
  }
}

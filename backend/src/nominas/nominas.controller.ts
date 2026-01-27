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
import { NominasService } from './nominas.service';
import { CreateNominaDto, CalcularNominaDto, AprobarNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nominas')
@UseGuards(JwtAuthGuard)
export class NominasController {
  constructor(private readonly nominasService: NominasService) { }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('periodoId') periodoId?: number,
    @Request() req?: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.nominasService.findAll(page, limit, { periodoId, empresaId });
  }

  @Get('vouchers')
  getVouchers(
    @Query('periodoId') periodoId: number,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.nominasService.getVouchers(periodoId, empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nominasService.findOne(+id);
  }

  @Post()
  create(@Body() createNominaDto: CreateNominaDto, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const userId = req.user.userId;
    return this.nominasService.create({
      ...createNominaDto,
      empresaId,
      usuarioCreacion: userId,
    });
  }

  @Post('generar/:periodoId')
  generarNominas(@Param('periodoId') periodoId: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const userId = req.user.userId;
    return this.nominasService.generarNominasParaPeriodo(+periodoId, empresaId, userId);
  }

  @Post('calcular')
  calcular(@Body() calcularDto: CalcularNominaDto) {
    return this.nominasService.calcularNomina(calcularDto.nominaId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateNominaDto: UpdateNominaDto,
  ) {
    return this.nominasService.update(+id, updateNominaDto);
  }

  @Put(':id/aprobar')
  aprobar(@Body() aprobarDto: AprobarNominaDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.nominasService.aprobarNomina(aprobarDto.nominaId, userId, aprobarDto.observaciones);
  }

  @Put(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.nominasService.marcarComoPagado(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nominasService.remove(+id);
  }

  @Post('horas-extras')
  crearHoraExtra(@Body() body: any, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const userId = req.user.userId;
    return this.nominasService.crearHoraExtra({
      ...body,
      empresaId,
      usuarioCreacion: userId,
    });
  }

  @Post('otros-pagos')
  crearOtroPago(@Body() body: any, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const userId = req.user.userId;
    return this.nominasService.crearOtroPago({
      ...body,
      empresaId,
      usuarioCreacion: userId,
    });
  }

  @Get('periodo/:periodoId/empleados')
  async getEmpleadosConNominas(@Param('periodoId') periodoId: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.nominasService.getEmpleadosConNominasParaPeriodo(+periodoId, empresaId);
  }

  @Delete('otros-pagos/:id')
  removeOtroPago(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.nominasService.removeOtroPago(+id, empresaId);
  }

  @Put('otros-pagos/:id')
  updateOtroPago(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.nominasService.updateOtroPago(+id, dto, empresaId);
  }

  @Delete('horas-extras/:id')
  removeHoraExtra(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.nominasService.removeHoraExtra(+id, empresaId);
  }

  @Put('horas-extras/:id')
  updateHoraExtra(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.nominasService.updateHoraExtra(+id, dto, empresaId);
  }
}


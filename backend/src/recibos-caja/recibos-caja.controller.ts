import { Controller, Post, Get, Patch, Body, Query, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecibosCajaService } from './recibos-caja.service';
import { CreateReciboCajaDto } from './dto/create-recibo-caja.dto';

@Controller('recibos-caja')
@UseGuards(JwtAuthGuard)
export class RecibosCajaController {
    constructor(private readonly recibosCajaService: RecibosCajaService) { }

    @Get()
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('fecha_desde') fecha_desde: string,
        @Query('fecha_hasta') fecha_hasta: string,
        @Query('codigo') codigo: string,
        @Query('instalacion_codigo') instalacion_codigo: string,
        @Query('nombre') nombre: string,
        @Query('factura') factura: string,
        @Query('documento') documento: string,
        @Query('n_tipo') n_tipo: string,
        @Request() req: any
    ) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit !== undefined && limit !== null ? parseInt(limit) : 10;

        const filters = {
            fecha_desde,
            fecha_hasta,
            codigo,
            instalacion_codigo,
            nombre,
            factura,
            documento,
            n_tipo
        };

        return this.recibosCajaService.findAll(empresaId, pageNum, limitNum, filters);
    }

    @Post()
    async create(@Body() createReciboCajaDto: CreateReciboCajaDto, @Request() req: any) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        const usuario = req.user?.email;
        return this.recibosCajaService.create(createReciboCajaDto, empresaId, usuario);
    }

    @Patch(':id/anular')
    async anular(@Param('id') id: string, @Request() req: any) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.recibosCajaService.anular(parseInt(id), empresaId);
    }
}

import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { MigracionContabilidadService } from './migracion-contabilidad.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('migracion-contabilidad')
@UseGuards(JwtAuthGuard)
export class MigracionContabilidadController {
    constructor(private readonly migracionService: MigracionContabilidadService) { }

    @Post('migrar-facturas')
    async migrar(@Body() body: { mes: number; year: number }, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.migrarFacturas(body.mes, body.year, empresaId);
    }

    @Post('migrar-cartera')
    async migrarCartera(@Body() body: { mes: number; year: number }, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.migrarCartera(body.mes, body.year, empresaId);
    }

    @Post('migrar-detalles')
    async migrarDetalles(@Body() body: { mes: number; year: number }, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.migrarDetalles(body.mes, body.year, empresaId);
    }

    @Get('facturas-periodo')
    async getFacturas(@Query('mes') mes: number, @Query('year') year: number, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.getFacturasPeriodo(mes, year, empresaId);
    }

    @Get('facturas-cartera-periodo')
    async getFacturasCartera(@Query('mes') mes: number, @Query('year') year: number, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.getFacturasCarteraPeriodo(mes, year, empresaId);
    }

    @Get('facturas-detalle-periodo')
    async getFacturasDetalle(@Query('mes') mes: number, @Query('year') year: number, @Request() req) {
        const empresaId = req.user.empresaId;
        return this.migracionService.getFacturasDetallePeriodo(mes, year, empresaId);
    }

    @Post('migrar-factura-individual')
    async migrarIndividual(@Body() body: any) {
        return this.migracionService.migrarFacturaIndividual(body);
    }

    @Post('migrar-factura-cartera-individual')
    async migrarCarteraIndividual(@Body() body: any) {
        return this.migracionService.migrarFacturaCarteraIndividual(body);
    }

    @Post('migrar-factura-detalle-individual')
    async migrarDetalleIndividual(@Body() body: any) {
        return this.migracionService.migrarFacturaDetalleIndividual(body);
    }
}

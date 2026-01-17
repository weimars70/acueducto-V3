import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { MigracionContabilidadService } from './migracion-contabilidad.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('migracion-contabilidad')
@UseGuards(JwtAuthGuard)
export class MigracionContabilidadController {
    constructor(private readonly migracionService: MigracionContabilidadService) { }

    @Post('migrar-facturas')
    async migrar(@Body() body: { mes: number; year: number; empresaId: number }) {
        return this.migracionService.migrarFacturas(body.mes, body.year, body.empresaId);
    }

    @Get('facturas-periodo')
    async getFacturas(@Query('mes') mes: number, @Query('year') year: number, @Query('empresaId') empresaId: number) {
        return this.migracionService.getFacturasPeriodo(mes, year, empresaId);
    }

    @Get('facturas-cartera-periodo')
    async getFacturasCartera(@Query('mes') mes: number, @Query('year') year: number, @Query('empresaId') empresaId: number) {
        return this.migracionService.getFacturasCarteraPeriodo(mes, year, empresaId);
    }

    @Post('migrar-factura-individual')
    async migrarIndividual(@Body() body: any) {
        return this.migracionService.migrarFacturaIndividual(body);
    }

    @Post('migrar-factura-cartera-individual')
    async migrarCarteraIndividual(@Body() body: any) {
        return this.migracionService.migrarFacturaCarteraIndividual(body);
    }
}

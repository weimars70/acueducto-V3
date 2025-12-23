import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FacturasService } from './facturas.service';

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturasController {
    constructor(private readonly facturasService: FacturasService) { }

    @Get()
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('mes') mes: string,
        @Query('year') year: string,
        @Query('factura') factura: string,
        @Query('nombre') nombre: string,
        @Query('ident') ident: string,
        @Query('instalacion_codigo') instalacion_codigo: string,
        @Query('direccion') direccion: string,
        @Query('ciudad_nombre') ciudad_nombre: string,
        @Query('sector_nombre') sector_nombre: string,
        @Request() req: any,
    ) {
        console.log('\n=== FACTURAS CONTROLLER ===');
        console.log('Query params recibidos:', { page, limit, mes, year, factura, nombre, ident, instalacion_codigo, direccion, ciudad_nombre, sector_nombre });

        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        console.log('Empresa ID extraído:', empresaId);

        const filters = {
            factura,
            nombre,
            ident,
            instalacion_codigo,
            direccion,
            ciudad_nombre,
            sector_nombre
        };

        return this.facturasService.findAll(
            empresaId,
            parseInt(page) || 1,
            parseInt(limit) || 20,
            mes ? parseInt(mes) : undefined,
            year ? parseInt(year) : undefined,
            filters
        );
    }
}

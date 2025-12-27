import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FacturacionService, ValidarPrefacturasDto, GenerarFacturasDto } from './facturacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('facturacion')
export class FacturacionController {
    constructor(private readonly facturacionService: FacturacionService) { }

    @Post('validar-prefacturas')
    @UseGuards(JwtAuthGuard)
    async validarPrefacturas(@Body() dto: ValidarPrefacturasDto) {
        return this.facturacionService.validarPrefacturas(dto);
    }

    @Post('generar-facturas')
    @UseGuards(JwtAuthGuard)
    async generarFacturas(@Body() dto: GenerarFacturasDto, @Request() req: any) {
        const usuario = req.user?.email || 'sistema';
        return this.facturacionService.generarFacturas(dto, usuario);
    }
}

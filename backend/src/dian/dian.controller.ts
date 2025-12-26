import { Controller, Post, Get, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { DianService, EnviarDianDto } from './dian.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dian')
export class DianController {
    constructor(private readonly dianService: DianService) { }

    @Post('enviar-facturas')
    @UseGuards(JwtAuthGuard)  // Solo valida JWT al enviar facturas
    async enviarFacturasDian(@Body() dto: EnviarDianDto) {
        return this.dianService.enviarFacturasDian(dto);
    }

    @Get('progress')
    // Sin guard - no valida JWT en cada polling
    async getProgress(
        @Query('empresaId') empresaId: string,
        @Query('year') year: string,
        @Query('mes') mes: string,
        @Res() res: Response
    ) {
        const progress = await this.dianService.getProgress(
            parseInt(empresaId),
            parseInt(year),
            parseInt(mes)
        );

        // Headers para evitar cache
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        return res.json(progress);
    }
}

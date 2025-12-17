import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GenerarPrefacturaDto } from './dto/generar-prefactura.dto';
import { PrefacturaService } from './prefactura.service';

@Controller('prefactura')
@UseGuards(JwtAuthGuard)
export class PrefacturaController {
    constructor(private readonly prefacturaService: PrefacturaService) { }

    @Post('generar')
    generar(@Body() dto: GenerarPrefacturaDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        const usuarioEmail = req.user.email;
        return this.prefacturaService.generarPrefactura(dto, empresaId, usuarioEmail);
    }

    @Get('meses')
    getMeses() {
        return this.prefacturaService.getMeses();
    }
}

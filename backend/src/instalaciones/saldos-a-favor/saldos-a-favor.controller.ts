import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SaldosAFavorService } from './saldos-a-favor.service';
import { CreateMovimientoSaldoAFavorDto } from './dto/create-saldo-a-favor.dto';

@Controller('saldos-a-favor')
@UseGuards(JwtAuthGuard)
export class SaldosAFavorController {
    constructor(private readonly saldosService: SaldosAFavorService) { }

    @Post()
    create(@Body() createDto: CreateMovimientoSaldoAFavorDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        const usuarioEmail = req.user.email;

        return this.saldosService.create({
            ...createDto,
            empresaId,
            usuario: usuarioEmail
        });
    }

    @Get()
    findAll(@Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.saldosService.findAll(empresaId);
    }
}

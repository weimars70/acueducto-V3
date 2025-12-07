import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('movimientos-inventario')
@UseGuards(JwtAuthGuard)
export class MovimientosInventarioController {
    constructor(private readonly service: MovimientosInventarioService) { }

    @Get()
    findAll(@Query('empresaId') empresaId: string) {
        return this.service.findAll(+empresaId);
    }
}

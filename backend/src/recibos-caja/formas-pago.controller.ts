import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FormasPagoService } from './formas-pago.service';

@Controller('formas-pago')
@UseGuards(JwtAuthGuard)
export class FormasPagoController {
    constructor(private readonly formasPagoService: FormasPagoService) { }

    @Get()
    async findAll(@Request() req: any) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.formasPagoService.findAll(empresaId);
    }
}

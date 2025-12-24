import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TiposReciboService } from './tipos-recibo.service';

@Controller('tipos-recibo')
@UseGuards(JwtAuthGuard)
export class TiposReciboController {
    constructor(private readonly tiposReciboService: TiposReciboService) { }

    @Get()
    async findAll(@Request() req: any) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.tiposReciboService.findAll(empresaId);
    }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DianNominaService } from './dian-nomina.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dian-nomina')
@UseGuards(JwtAuthGuard)
export class DianNominaController {
    constructor(private readonly dianNominaService: DianNominaService) { }

    @Get('json/:id')
    async getNominaJson(@Param('id') id: string) {
        return this.dianNominaService.generatePayrollJson(+id);
    }
}

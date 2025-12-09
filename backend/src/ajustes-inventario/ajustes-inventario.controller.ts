import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AjustesInventarioService } from './ajustes-inventario.service';
import { CreateAjusteInventarioDto } from './dto/create-ajuste-inventario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ajustes-inventario')
@UseGuards(JwtAuthGuard)
export class AjustesInventarioController {
    constructor(private readonly ajustesInventarioService: AjustesInventarioService) { }

    @Get()
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('itemNombre') itemNombre: string,
        @Query('tipoAjuste') tipoAjuste: string,
        @Req() req: any,
    ) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        const filters: Record<string, any> = {};

        if (itemNombre) filters.itemNombre = itemNombre;
        if (tipoAjuste) filters.tipoAjuste = tipoAjuste;

        return this.ajustesInventarioService.findAll(
            empresaId,
            parseInt(page) || 1,
            parseInt(limit) || 20,
            filters
        );
    }

    @Get('items')
    async getItems(
        @Query('search') search: string,
        @Req() req: any,
    ) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.ajustesInventarioService.getItems(empresaId, search);
    }

    @Get('estadisticas')
    async getEstadisticas(@Req() req: any) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.ajustesInventarioService.getEstadisticas(empresaId);
    }

    @Post()
    async create(
        @Body() createAjusteDto: CreateAjusteInventarioDto,
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.email || 'sistema';
        const empresaId = req.user?.empresaId || req.user?.empresa_id;
        return this.ajustesInventarioService.create(createAjusteDto, userId, empresaId);
    }
}

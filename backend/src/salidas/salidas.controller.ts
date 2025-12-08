import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('salidas')
@UseGuards(JwtAuthGuard)
export class SalidasController {
    constructor(private readonly salidasService: SalidasService) { }

    @Get()
    findAll(@Query('empresaId', ParseIntPipe) empresaId: number) {
        return this.salidasService.findAll(empresaId);
    }

    @Get('clientes')
    async getClientes(@Req() req) {
        const empresaId = req.user.empresaId;
        return this.salidasService.getClientes(empresaId);
    }

    @Get('clientes/search')
    async searchClientes(@Query('q') query: string, @Req() req) {
        const empresaId = req.user.empresaId;
        return this.salidasService.searchClientes(query, empresaId);
    }

    @Get('items')
    async getItems() {
        return this.salidasService.getItems();
    }

    @Get('items/search')
    async searchItems(@Query('q') query: string, @Req() req) {
        const empresaId = req.user.empresaId;
        return this.salidasService.searchItems(query, empresaId);
    }

    @Post()
    async create(@Body() createSalidaDto: CreateSalidaDto, @Req() req) {
        const userId = req.user.userId;
        const empresaId = req.user.empresaId;
        return this.salidasService.create(createSalidaDto, userId, empresaId);
    }
}

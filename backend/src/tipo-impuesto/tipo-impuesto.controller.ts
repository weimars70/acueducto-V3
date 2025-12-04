import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TipoImpuestoService } from './tipo-impuesto.service';
import { CreateTipoImpuestoDto } from './dto/create-tipo-impuesto.dto';
import { UpdateTipoImpuestoDto } from './dto/update-tipo-impuesto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-impuesto')
export class TipoImpuestoController {
    constructor(private readonly tipoImpuestoService: TipoImpuestoService) { }

    @Get('view')
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query() filters: Record<string, any>,
    ) {
        delete filters.page;
        delete filters.limit;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        return this.tipoImpuestoService.findAll(pageNumber, pageSize, filters);
    }

    @Get(':codigo')
    async findOne(@Param('codigo') codigo: string) {
        return this.tipoImpuestoService.findOne(parseInt(codigo, 10));
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTipoImpuestoDto: CreateTipoImpuestoDto) {
        return this.tipoImpuestoService.create(createTipoImpuestoDto);
    }

    @Put(':codigo')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('codigo') codigo: string,
        @Body() updateTipoImpuestoDto: UpdateTipoImpuestoDto,
    ) {
        return this.tipoImpuestoService.update(parseInt(codigo, 10), updateTipoImpuestoDto);
    }

    @Delete(':codigo')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('codigo') codigo: string) {
        return this.tipoImpuestoService.remove(parseInt(codigo, 10));
    }
}

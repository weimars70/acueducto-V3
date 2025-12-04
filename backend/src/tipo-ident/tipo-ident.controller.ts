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
import { TipoIdentService } from './tipo-ident.service';
import { CreateTipoIdentDto } from './dto/create-tipo-ident.dto';
import { UpdateTipoIdentDto } from './dto/update-tipo-ident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-ident')
export class TipoIdentController {
    constructor(private readonly tipoIdentService: TipoIdentService) { }

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

        return this.tipoIdentService.findAll(pageNumber, pageSize, filters);
    }

    @Get(':codigo')
    async findOne(@Param('codigo') codigo: string) {
        return this.tipoIdentService.findOne(parseInt(codigo, 10));
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTipoIdentDto: CreateTipoIdentDto) {
        return this.tipoIdentService.create(createTipoIdentDto);
    }

    @Put(':codigo')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('codigo') codigo: string,
        @Body() updateTipoIdentDto: UpdateTipoIdentDto,
    ) {
        return this.tipoIdentService.update(parseInt(codigo, 10), updateTipoIdentDto);
    }

    @Delete(':codigo')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('codigo') codigo: string) {
        return this.tipoIdentService.remove(parseInt(codigo, 10));
    }
}

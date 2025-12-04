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
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tarifas')
export class TarifasController {
    constructor(private readonly tarifasService: TarifasService) { }

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

        return this.tarifasService.findAll(pageNumber, pageSize, filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tarifasService.findOne(parseInt(id, 10));
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTarifaDto: CreateTarifaDto) {
        return this.tarifasService.create(createTarifaDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateTarifaDto: UpdateTarifaDto,
    ) {
        return this.tarifasService.update(parseInt(id, 10), updateTarifaDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.tarifasService.remove(parseInt(id, 10));
    }
}

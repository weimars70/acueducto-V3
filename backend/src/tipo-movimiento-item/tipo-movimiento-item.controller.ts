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
    ParseIntPipe,
} from '@nestjs/common';
import { TipoMovimientoItemService } from './tipo-movimiento-item.service';
import { CreateTipoMovimientoItemDto } from './dto/create-tipo-movimiento-item.dto';
import { UpdateTipoMovimientoItemDto } from './dto/update-tipo-movimiento-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipo-movimiento-item')
@UseGuards(JwtAuthGuard)
export class TipoMovimientoItemController {
    constructor(private readonly tipoMovimientoItemService: TipoMovimientoItemService) { }

    @Post()
    create(@Body() createDto: CreateTipoMovimientoItemDto) {
        return this.tipoMovimientoItemService.create(createDto);
    }

    @Get()
    findAll(@Query('empresaId', ParseIntPipe) empresaId: number) {
        return this.tipoMovimientoItemService.findAll(empresaId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Query('empresaId', ParseIntPipe) empresaId: number) {
        return this.tipoMovimientoItemService.findOne(id, empresaId);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTipoMovimientoItemDto,
    ) {
        return this.tipoMovimientoItemService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tipoMovimientoItemService.remove(id);
    }
}

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
import { ItemsGruposService } from './items-grupos.service';
import { CreateItemGrupoDto } from './dto/create-item-grupo.dto';
import { UpdateItemGrupoDto } from './dto/update-item-grupo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('items-grupos')
@UseGuards(JwtAuthGuard)
export class ItemsGruposController {
    constructor(private readonly itemsGruposService: ItemsGruposService) { }

    @Post()
    create(@Body() createItemGrupoDto: CreateItemGrupoDto) {
        return this.itemsGruposService.create(createItemGrupoDto);
    }

    @Get()
    findAll(@Query('empresaId', ParseIntPipe) empresaId: number) {
        return this.itemsGruposService.findAll(empresaId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Query('empresaId', ParseIntPipe) empresaId: number) {
        return this.itemsGruposService.findOne(id, empresaId);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateItemGrupoDto: UpdateItemGrupoDto,
    ) {
        return this.itemsGruposService.update(id, updateItemGrupoDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.itemsGruposService.remove(id);
    }
}

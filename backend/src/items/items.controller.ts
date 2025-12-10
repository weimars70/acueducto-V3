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
    Req,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Post()
    create(@Body() createDto: CreateItemDto) {
        return this.itemsService.create(createDto);
    }

    @Get()
    findAll(@Req() req) {
        const empresaId = req.user.empresaId;
        return this.itemsService.findAll(empresaId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        const empresaId = req.user.empresaId;
        return this.itemsService.findOne(id, empresaId);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateItemDto,
    ) {
        return this.itemsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.itemsService.remove(id);
    }
}

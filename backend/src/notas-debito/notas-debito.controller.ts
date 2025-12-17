import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { NotasDebitoService } from './notas-debito.service';
import { CreateNotaDebitoDto } from './dto/create-nota-debito.dto';
import { UpdateNotaDebitoDto } from './dto/update-nota-debito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notas-debito')
@Controller('notas-debito')
@UseGuards(JwtAuthGuard)
export class NotasDebitoController {
    constructor(private readonly notasDebitoService: NotasDebitoService) { }

    @Post()
    create(@Body() createNotaDebitoDto: CreateNotaDebitoDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        const usuarioEmail = req.user.email;
        return this.notasDebitoService.create({
            ...createNotaDebitoDto,
            empresaId,
            usuario: usuarioEmail,
        });
    }

    @Get()
    findAll(@Query('empresaId') empresaId: string) {
        return this.notasDebitoService.findAll(+empresaId);
    }

    @Get(':codigo/:empresaId')
    findOne(
        @Param('codigo') codigo: string,
        @Param('empresaId') empresaId: string,
    ) {
        return this.notasDebitoService.findOne(+codigo, +empresaId);
    }

    @Patch(':codigo/:empresaId')
    update(
        @Param('codigo') codigo: string,
        @Param('empresaId') empresaId: string,
        @Body() updateNotaDebitoDto: UpdateNotaDebitoDto,
    ) {
        return this.notasDebitoService.update(
            +codigo,
            +empresaId,
            updateNotaDebitoDto,
        );
    }

    @Delete(':codigo/:empresaId')
    remove(@Param('codigo') codigo: string, @Param('empresaId') empresaId: string) {
        return this.notasDebitoService.remove(+codigo, +empresaId);
    }
}

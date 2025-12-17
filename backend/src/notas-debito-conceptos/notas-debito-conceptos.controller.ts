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
} from '@nestjs/common';
import { NotasDebitoConceptosService } from './notas-debito-conceptos.service';
import { CreateNotaDebitoConceptoDto } from './dto/create-nota-debito-concepto.dto';
import { UpdateNotaDebitoConceptoDto } from './dto/update-nota-debito-concepto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notas-debito-conceptos')
@UseGuards(JwtAuthGuard)
export class NotasDebitoConceptosController {
    constructor(private readonly service: NotasDebitoConceptosService) { }

    @Post()
    create(@Body() createDto: CreateNotaDebitoConceptoDto, @Request() req: any) {
        const empresaId = req.user.empresaId;
        const usuarioEmail = req.user.email;
        return this.service.create({
            ...createDto,
            empresaId,
            usuario: usuarioEmail,
        });
    }

    @Get()
    findAll(@Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.findAll(empresaId);
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string, @Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.findOne(+codigo, empresaId);
    }

    @Patch(':codigo')
    update(
        @Param('codigo') codigo: string,
        @Body() updateDto: UpdateNotaDebitoConceptoDto,
        @Request() req: any,
    ) {
        const empresaId = req.user.empresaId;
        return this.service.update(+codigo, updateDto, empresaId);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string, @Request() req: any) {
        const empresaId = req.user.empresaId;
        return this.service.remove(+codigo, empresaId);
    }
}

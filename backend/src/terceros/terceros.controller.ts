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
import { TercerosService } from './terceros.service';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { UpdateTerceroDto } from './dto/update-tercero.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('terceros')
@UseGuards(JwtAuthGuard)
export class TercerosController {
    constructor(private readonly tercerosService: TercerosService) { }

    @Get('select/ciudades')
    getCiudades(@Query('empresaId') empresaId?: string) {
        return this.tercerosService.getCiudades(empresaId ? parseInt(empresaId) : undefined);
    }

    @Get('select/tipo-regimen')
    getTipoRegimen(@Query('empresaId') empresaId?: string) {
        return this.tercerosService.getTipoRegimen(empresaId ? parseInt(empresaId) : undefined);
    }

    @Get('select/tipo-ident')
    getTipoIdent(@Query('empresaId') empresaId?: string) {
        return this.tercerosService.getTipoIdent(empresaId ? parseInt(empresaId) : undefined);
    }

    @Get('select/tipo-impuesto')
    getTipoImpuesto(@Query('empresaId') empresaId?: string) {
        return this.tercerosService.getTipoImpuesto(empresaId ? parseInt(empresaId) : undefined);
    }

    @Post()
    create(@Body() createTerceroDto: CreateTerceroDto) {
        return this.tercerosService.create(createTerceroDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('empresaId') empresaId?: string,
        @Query('nombre') nombre?: string,
        @Query('identificacion') identificacion?: string,
        @Query('cliente') cliente?: string,
        @Query('proveedor') proveedor?: string,
    ) {
        return this.tercerosService.findAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            empresaId: empresaId ? parseInt(empresaId) : undefined,
            nombre,
            identificacion,
            cliente: cliente ? cliente === 'true' : undefined,
            proveedor: proveedor ? proveedor === 'true' : undefined,
        });
    }

    @Get(':codigo')
    findOne(@Param('codigo') codigo: string, @Query('empresaId') empresaId?: string) {
        return this.tercerosService.findOne(
            parseInt(codigo),
            empresaId ? parseInt(empresaId) : undefined
        );
    }

    @Put(':codigo')
    update(
        @Param('codigo') codigo: string,
        @Body() updateTerceroDto: UpdateTerceroDto,
    ) {
        return this.tercerosService.update(parseInt(codigo), updateTerceroDto);
    }

    @Delete(':codigo')
    remove(@Param('codigo') codigo: string) {
        return this.tercerosService.remove(parseInt(codigo));
    }
}

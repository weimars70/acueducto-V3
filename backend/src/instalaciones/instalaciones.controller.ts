import { Controller, Get, Query, NotFoundException, Request, Post, Body, UseGuards, Put, Param } from '@nestjs/common';
import { InstalacionesService } from './instalaciones.service';
import { GetInstalacionDto } from './dto/get-instalacion.dto';
import { CreateInstalacionDto } from './dto/create-instalacion.dto';
import { UpdateInstalacionDto } from './dto/update-instalacion.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('instalaciones')
@Controller('instalaciones')
@UseGuards(JwtAuthGuard)
export class InstalacionesController {
  constructor(private readonly instalacionesService: InstalacionesService) { }

  @Get()
  @ApiOperation({ summary: 'Get installation by code' })
  @ApiResponse({ status: 200, description: 'Installation found successfully' })
  @ApiResponse({ status: 404, description: 'Installation not found' })
  async getInstalacion(@Query() query: any) {
    //console.log('🎯 Controller GET /instalaciones - Llamado');
    //console.log('📊 Query params recibidos:', query);
    // console.log('📋 Código:', query.codigo, 'tipo:', typeof query.codigo);

    try {
      const codigoNum = Number(query.codigo);
      //console.log('🔄 Llamando a instalacionesService.findOne con código:', codigoNum);
      const result = await this.instalacionesService.findOne(codigoNum);
      //console.log('✅ Instalación encontrada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en getInstalacion:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error consultando installation: ${error.message}`);
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all installations' })
  @ApiResponse({
    status: 200,
    description: 'Installations retrieved successfully',
  })
  async getAllInstalaciones(@Query('empresaId') empresaId?: number, @Query('search') search?: string) {
    try {
      return await this.instalacionesService.findAll(empresaId, search);
    } catch (error) {
      throw new Error(`Error retrieving installations: ${error.message}`);
    }
  }

  @Post('list')
  @ApiOperation({ summary: 'Get paginated installations list' })
  @ApiResponse({
    status: 200,
    description: 'Installations list retrieved successfully',
  })
  async getInstalacionesList(
    @Body() body: {
      page?: number;
      limit?: number;
      filters?: Record<string, any>;
    },
    @Request() req: any,
  ) {
    try {
      const empresaId = req.user.empresaId;
      const page = body.page || 1;
      const limit = body.limit || 20;
      const filters = body.filters || {};

      return await this.instalacionesService.findAllPaginated(
        empresaId,
        page,
        limit,
        filters
      );
    } catch (error) {
      throw new Error(`Error retrieving installations: ${error.message}`);
    }
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Get installation by codigo' })
  @ApiResponse({ status: 200, description: 'Installation found successfully' })
  @ApiResponse({ status: 404, description: 'Installation not found' })
  async getOne(@Param('codigo') codigo: string) {
    try {
      const codigoNum = parseInt(codigo, 10);
      if (isNaN(codigoNum)) {
        throw new NotFoundException(`Código de instalación inválido: ${codigo}`);
      }
      return await this.instalacionesService.findOne(codigoNum);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error getting installation: ${error.message}`);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new installation' })
  @ApiResponse({ status: 201, description: 'Installation created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInstalacionDto: CreateInstalacionDto, @Request() req: any) {
    try {
      // Agregar empresa_id del usuario autenticado
      createInstalacionDto.empresa_id = req.user.empresaId;
      return await this.instalacionesService.create(createInstalacionDto);
    } catch (error) {
      throw new Error(`Error creating installation: ${error.message}`);
    }
  }

  @Put(':codigo')
  @ApiOperation({ summary: 'Update an installation' })
  @ApiResponse({ status: 200, description: 'Installation updated successfully' })
  @ApiResponse({ status: 404, description: 'Installation not found' })
  async update(
    @Param('codigo') codigo: number,
    @Body() updateInstalacionDto: UpdateInstalacionDto,
  ) {
    try {
      return await this.instalacionesService.update(codigo, updateInstalacionDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error updating installation: ${error.message}`);
    }
  }
}

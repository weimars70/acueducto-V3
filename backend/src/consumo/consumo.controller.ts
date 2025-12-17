import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Put,
  Sse,
  Header,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConsumoService } from './consumo.service';
import { CreateConsumoDto } from './dto/create-consumo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { multerConfig } from '../config/multer.config';
import { createReadStream, existsSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';

@Controller('consumo')
@UseGuards(JwtAuthGuard)
export class ConsumoController {
  constructor(private readonly consumoService: ConsumoService) {}

  @Get('previous-reading/:instalacion/:codigo')
  async getPreviousReading(
    @Param('instalacion') instalacion: string,
    @Param('codigo') codigo: string,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.consumoService.getPreviousReading(
      parseInt(instalacion, 10),
      parseInt(codigo, 10),
      empresaId,
    );
  }

  @Get('basic/:id')
  async getBasicInfo(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.consumoService.getBasicInfo(parseInt(id, 10), empresaId);
  }

  @Get('view')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query() filters: Record<string, any>,
    @Request() req: any,
  ) {
    delete filters.page;
    delete filters.limit;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const empresaId = req.user.empresaId;

    return this.consumoService.findAll(pageNumber, pageSize, { ...filters, empresaId });
  }

  @Get('last-readings')
  async getLastReadings(
    @Query('year') year: number,
    @Query('month') month: number,
    @Request() req: any,
  ) {
    console.log('year', year);
    console.log('month', month);
    const empresaId = req.user.empresaId;
    return this.consumoService.getLastReadings(year, month, empresaId);
  }

  @Get('last-lecturas')
  async getLastLecturas(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.consumoService.getLecturasMes(month, year, empresaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const empresaId = req.user.empresaId;
    return this.consumoService.findOne(parseInt(id, 10), empresaId);
  }

  @Post()
  async create(@Body() createConsumoDto: any, @Request() req: any) {
    const empresaId = req.user.empresaId;
    const usuarioEmail = req.user.email;
    return this.consumoService.create(createConsumoDto, empresaId, usuarioEmail);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConsumoDto: CreateConsumoDto,
    @Request() req: any,
  ) {
    const empresaId = req.user.empresaId;
    const usuarioEmail = req.user.email;
    return this.consumoService.update(parseInt(id, 10), updateConsumoDto, empresaId, usuarioEmail);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    try {
      // Obtener consumo para generar nombre correcto
      const consumo = await this.consumoService.findOne(+id, req.user.empresaId);

      if (!consumo) {
        unlinkSync(file.path); // Eliminar archivo temporal
        throw new NotFoundException(`Consumo #${id} no encontrado`);
      }

      // Generar nombre final simplificado: {instalacion}.jpg
      // (ya está en empresa/año/mes, no necesita año/mes en el nombre)
      const finalFilename = `${consumo.instalacion}.jpg`;
      const finalPath = join(file.destination, finalFilename);

      // Si existe archivo anterior, eliminarlo
      if (existsSync(finalPath)) {
        unlinkSync(finalPath);
      }

      // Renombrar archivo temporal al nombre final
      renameSync(file.path, finalPath);

      // Guardar ruta relativa en base de datos
      // Estructura: empresa_{id}/año/mes/instalacion.jpg
      const relativePath = `empresa_${req.user.empresaId}/${consumo.year}/${consumo.mes.toString().padStart(2, '0')}/${finalFilename}`;
      await this.consumoService.updateImageUrl(+id, relativePath, req.user.empresaId);

      return {
        success: true,
        imagenUrl: relativePath,
        message: 'Imagen subida exitosamente'
      };
    } catch (error) {
      // Limpiar archivo si algo sale mal
      if (file && file.path && existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Get(':id/image')
  async getImage(
    @Param('id') id: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const consumo = await this.consumoService.findOne(+id, req.user.empresaId);

    if (!consumo || !consumo.imagenUrl) {
      throw new NotFoundException('Imagen no encontrada');
    }

    const uploadsPath = process.env.UPLOADS_PATH || './uploads/consumo-images';
    const imagePath = join(uploadsPath, consumo.imagenUrl);

    if (!existsSync(imagePath)) {
      throw new NotFoundException('Archivo de imagen no existe');
    }

    const file = createReadStream(imagePath);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="instalacion_${consumo.instalacion}_${consumo.mes}_${consumo.year}.jpg"`
    });

    return new StreamableFile(file);
  }

  @Sse('events')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  events(): Observable<MessageEvent> {
    return this.consumoService.getConsumptionEvents().pipe(
      map((event) => {
        const messageEvent = new MessageEvent('consumo_update', {
          data: JSON.stringify(event),
          lastEventId: String(Date.now()),
        });
        return messageEvent;
      }),
    );
  }
}

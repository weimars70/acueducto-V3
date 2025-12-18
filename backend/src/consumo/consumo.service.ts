import { Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Consumption } from '../entities/consumption.entity';
import { CreateConsumoDto } from './dto/create-consumo.dto';
import { Observable, fromEvent } from 'rxjs';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConsumoService implements OnModuleInit {
  private eventEmitter: EventEmitter;

  constructor(
    @InjectRepository(Consumption)
    private readonly consumoRepository: Repository<Consumption>,
    private connection: Connection,
  ) {
    this.eventEmitter = new EventEmitter();
  }

  async onModuleInit() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('LISTEN consumo_channel');

      const client = queryRunner.stream as any;
      if (client && client.connection) {
        client.connection.on(
          'notification',
          (msg: { channel: string; payload?: string }) => {
            if (msg.channel === 'consumo_channel') {
              this.eventEmitter.emit('consumption_update', {
                type: 'consumo_update',
                data: msg.payload ? JSON.parse(msg.payload) : {},
              });
            }
          },
        );
      }
    } catch (error) {
      console.error('Error setting up PostgreSQL notifications:', error);
    }
  }

  async findOne(id: number, empresaId: number) {

    try {
      if (isNaN(id) || !Number.isInteger(id)) {
        throw new Error('El ID debe ser un número entero válido');
      }

      const consumption = await this.consumoRepository
        .createQueryBuilder('consumo')
        .where('consumo.codigo = :id', { id })
        .andWhere('consumo.empresa_id = :empresaId', { empresaId })
        .getOne();

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return consumption;
    } catch (error) {
      throw new Error(`Error al obtener consumo: ${error.message}`);
    }
  }

  async getPreviousReading(instalacion: number, codigo: number, empresaId: number) {
    try {
      const result = await this.consumoRepository.query(
        `SELECT * FROM get_previous_reading($1,$2,$3)`,
        [instalacion, codigo, empresaId],
      );

      if (!result || result.length === 0) {
        return {
          lectura_anterior: 0,
          promedio: 0,
        };
      }

      return result[0];
    } catch (error) {
      throw new Error(`Error al obtener lectura anterior: ${error.message}`);
    }
  }

  async getBasicInfo(id: number, empresaId: number) {
    try {
      const result = await this.consumoRepository
        .createQueryBuilder('consumo')
        .select([
          'consumo.mes_codigo',
          'consumo.year',
          'consumo.instalacion',
          'consumo.nombre as cliente',
          'consumo.sector as sector',
          'consumo.direccion',
          'consumo.lectura as lectura_actual',
        ])
        .where('consumo.codigo = :id', { id })
        .andWhere('consumo.empresa_id = :empresaId', { empresaId })
        .getRawOne();

      if (!result) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return result;
    } catch (error) {
      throw new Error(`Error al obtener información básica: ${error.message}`);
    }
  }

  async findAll(page: number, limit: number, filters: Record<string, any>) {

    try {
      let query = `
        SELECT 
          v.codigo,
          v.instalacion,
          v.nombre,
          v.lectura,
          v.fecha,
          v.mes,
          v.year,
          v.mes_codigo,
          v.consumo,
          v.medidor,
          v.otros_cobros,
          v.reconexion,
          v.facturado,
          v.imagen_url
        FROM public.view_consumo v
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 1;

      // FILTRO OBLIGATORIO POR EMPRESA
      if (filters.empresaId) {
        query += ` AND v.empresa_id = $${paramCount}`;
        queryParams.push(filters.empresaId);
        paramCount++;
      }

      if (filters.nombre) {
        query += ` AND v.nombre ILIKE $${paramCount}`;
        queryParams.push(`%${filters.nombre}%`);
        paramCount++;
      }

      if (filters.year) {
        query += ` AND v.year = $${paramCount}`;
        queryParams.push(filters.year);
        paramCount++;
      }

      if (filters.mes_codigo) {
        query += ` AND v.mes_codigo = $${paramCount}`;
        queryParams.push(filters.mes_codigo);
        paramCount++;
      }

      if (filters.instalacion) {
        query += ` AND v.instalacion = $${paramCount}`;
        queryParams.push(filters.instalacion);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.consumoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.consumoRepository.query(query, queryParams);

      if (data.length > 0) {
        console.log('🔍 [ConsumoService] First row data:', data[0]);
        console.log('🔍 [ConsumoService] imagen_url:', data[0].imagen_url);
      }

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener consumos: ${error.message}`);
    }
  }

  async getLecturasMes(month: number, year: number, empresaId: number) {
    try {
      const result = await this.consumoRepository.query(
        ` SELECT a.codigo as Instalacion,a.nombre,c.nombre as sector,B.lectura, CASE WHEN B.lectura IS NULL THEN 'NO' ELSE 'SI' END AS REGISTRADA
          FROM instalaciones a
          JOIN SECTOR C ON C.CODIGO=a.sector_codigo
          LEFT JOIN CONSUMO B ON A.codigo=B.instalacion AND B.MES=$1 AND B.year=$2 AND B.empresa_id=$3
          WHERE a.empresa_id = $3
          order by a.codigo`,
        [month, year, empresaId],
      );
      return result;
    } catch (error) {
      throw new Error(`Error al obtener lectura anterior: ${error.message}`);
    }
  }

  async getLastReadings(year: number, month: number, empresaId: number) {
    console.log('year::', year);
    try {
      const result = await this.consumoRepository.query(
        `SELECT * FROM consumo where year=$1 and mes =$2 and empresa_id=$3`,
        [year, month, empresaId],
      );

      const latestReadings = new Map();
      result.forEach((reading) => {
        if (!latestReadings.has(reading.instalacion)) {
          latestReadings.set(reading.instalacion, reading);
        }
      });

      return Array.from(latestReadings.values()).sort(
        (a, b) => a.instalacion - b.instalacion,
      );
    } catch (error) {
      throw new Error(`Error al obtener últimas lecturas: ${error.message}`);
    }
  }

  async create(createConsumoDto: any, empresaId: number, usuarioEmail: string) {

    const sql = `SELECT COALESCE(count(*),0) AS registros
                 FROM public.consumo
                 WHERE instalacion=$1 AND mes=$2 AND year=$3 AND medidor=$4 AND empresa_id=$5`;
    const params = [
      createConsumoDto.instalacion,
      createConsumoDto.mes,
      createConsumoDto.year,
      createConsumoDto.medidor,
      empresaId,
    ];
    const result = await this.consumoRepository.query(sql, params);

    const registros = parseInt(result?.[0]?.registros ?? '0', 10);
    if (registros > 0) {
      return 'Error consumo ya existe';
    }

    try {

      const consumptionData: any = {
        instalacion: createConsumoDto.instalacion,
        lectura: createConsumoDto.lectura,
        fecha: createConsumoDto.fecha,
        consumo: createConsumoDto.consumo,
        mes: createConsumoDto.mes,
        year: createConsumoDto.year,
        medidor: createConsumoDto.medidor,
        otrosCobros: createConsumoDto.otrosCobros,
        reconexion: createConsumoDto.reconexion,
        usuario: usuarioEmail,
        latitud: createConsumoDto.latitud,
        longitud: createConsumoDto.longitud,
        empresaId: empresaId,
      };

      if (createConsumoDto.imagenBase64) {
        try {
          const uploadsPath = process.env.UPLOADS_PATH || './uploads/consumo-images';
          const relativeDir = `empresa_${empresaId}/${createConsumoDto.year}/${createConsumoDto.mes.toString().padStart(2, '0')}`;
          const fullDir = path.join(uploadsPath, relativeDir);

          if (!fs.existsSync(fullDir)) {
            fs.mkdirSync(fullDir, { recursive: true });
          }

          const fileName = `${createConsumoDto.instalacion}.jpg`;
          const filePath = path.join(fullDir, fileName);
          const relativePath = path.join(relativeDir, fileName);

          const base64Data = createConsumoDto.imagenBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');

          fs.writeFileSync(filePath, buffer);
          consumptionData.imagenUrl = relativePath;
        } catch (error) {
          console.error('Error saving image:', error);
          // Continue saving consumption even if image save fails
        }
      }


      const consumption = this.consumoRepository.create(consumptionData);
      const saved = await this.consumoRepository.save(consumption);

      const geoOk = consumptionData.latitud != null && consumptionData.longitud != null;
      const status = geoOk ? 'guardado con geolocalizacion' : 'guardado sin geolocalizacion';

      return status;
    } catch (error) {
      throw new Error(`Error al crear consumo: ${error.message}`);
    }
  }

  async update(id: number, updateConsumoDto: CreateConsumoDto, empresaId: number, usuarioEmail: string) {
    try {
      const consumption = await this.consumoRepository.findOne({
        where: { codigo: id, empresaId: empresaId },
      });

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      const consumptionData = {
        instalacion: updateConsumoDto.instalacion,
        lectura: updateConsumoDto.lectura,
        fecha: updateConsumoDto.fecha,
        consumo: updateConsumoDto.consumo,
        mes: updateConsumoDto.mes,
        year: updateConsumoDto.year,
        medidor: updateConsumoDto.medidor,
        otrosCobros: updateConsumoDto.otrosCobros,
        reconexion: updateConsumoDto.reconexion,
        usuario: usuarioEmail,
        latitud: updateConsumoDto.latitud,
        longitud: updateConsumoDto.longitud,
      };

      Object.assign(consumption, consumptionData);
      return await this.consumoRepository.save(consumption);
    } catch (error) {
      throw new Error(`Error al actualizar consumo: ${error.message}`);
    }
  }

  async updateImageUrl(
    id: number,
    imagenUrl: string,
    empresaId: number
  ): Promise<void> {
    const consumo = await this.consumoRepository.findOne({
      where: { codigo: id, empresaId }
    });

    if (!consumo) {
      throw new Error(`Consumo #${id} no encontrado`);
    }

    consumo.imagenUrl = imagenUrl;
    await this.consumoRepository.save(consumo);
  }

  getConsumptionEvents(): Observable<any> {
    return fromEvent(this.eventEmitter, 'consumption_update');
  }
}

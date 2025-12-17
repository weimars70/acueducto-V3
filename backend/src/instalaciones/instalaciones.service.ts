import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installation } from '../entities/installation.entity';

@Injectable()
export class InstalacionesService {
  constructor(
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
  ) { }

  async findOne(codigo: number) {
    try {
      const sql = `SELECT codigo, codigo_medidor,nombre, sector as sector_nombre, direccion FROM view_instalaciones WHERE view_instalaciones.codigo= ${codigo} `;

      const installation = await this.installationRepository.query(sql);

      if (!installation) {
        throw new Error(`Instalación con código ${codigo} no encontrada`);
      }
      // Obtener lectura anterior y promedio
      const result = await this.installationRepository.query(
        ` SELECT lectura_anterior, promedio FROM get_previous_reading($1)`,
        [codigo],
      );

      return {
        ...installation,
        lectura_anterior: result[0]?.lectura_anterior || 0,
        promedio: result[0]?.promedio || 0,
      };
    } catch (error) {
      console.log('Error::.', error);
      throw new Error(`Error al obtener instalación: ${error.message}`);
    }
  }

  async findAll(empresaId?: number, search?: string) {
    try {
      let query = 'SELECT * FROM view_instalaciones WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (empresaId) {
        query += ` AND empresa_id = $${paramCount}`;
        params.push(empresaId);
        paramCount++;
      }

      if (search) {
        const searchNumber = Number(search);
        if (!isNaN(searchNumber)) {
          query += ` AND (codigo = $${paramCount} OR nombre ILIKE $${paramCount + 1})`;
          params.push(searchNumber, `%${search}%`);
          paramCount += 2;
        } else {
          query += ` AND nombre ILIKE $${paramCount}`;
          params.push(`%${search}%`);
          paramCount++;
        }
      }

      query += ' ORDER BY codigo ASC LIMIT 20';

      return await this.installationRepository.query(query, params);
    } catch (error) {
      throw new Error(`Error al obtener instalaciones: ${error.message}`);
    }
  }
}

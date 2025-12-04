import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa } from '../entities/tarifa.entity';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';

@Injectable()
export class TarifasService {
    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifaRepository: Repository<Tarifa>,
    ) { }

    async findAll(page: number, limit: number, filters: Record<string, any>) {
        try {
            let query = `
        SELECT
          id,
          basico,
          complementario,
          desde,
          hasta,
          empresa_id,
          usuario
        FROM public.tarifas
        WHERE 1=1
      `;

            const queryParams: any[] = [];
            let paramCount = 1;

            // FILTRO OBLIGATORIO POR EMPRESA
            if (filters.empresaId) {
                query += ` AND empresa_id = $${paramCount}`;
                queryParams.push(filters.empresaId);
                paramCount++;
            }

            if (filters.desde) {
                query += ` AND desde >= $${paramCount}`;
                queryParams.push(filters.desde);
                paramCount++;
            }

            if (filters.hasta) {
                query += ` AND hasta <= $${paramCount}`;
                queryParams.push(filters.hasta);
                paramCount++;
            }

            // Obtener el total de registros
            const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
            const totalResult = await this.tarifaRepository.query(
                countQuery,
                queryParams,
            );
            const total = parseInt(totalResult[0].count);

            // Agregar paginación
            query += ` ORDER BY desde DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, (page - 1) * limit);

            const data = await this.tarifaRepository.query(query, queryParams);

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new Error(`Error al obtener tarifas: ${error.message}`);
        }
    }

    async findOne(id: number) {
        try {
            const tarifa = await this.tarifaRepository.findOne({
                where: { id },
            });

            if (!tarifa) {
                throw new Error(`Tarifa con ID ${id} no encontrada`);
            }

            return tarifa;
        } catch (error) {
            throw new Error(`Error al obtener tarifa: ${error.message}`);
        }
    }

    async create(createTarifaDto: CreateTarifaDto) {
        try {
            // Validar que desde sea menor que hasta
            const desde = new Date(createTarifaDto.desde);
            const hasta = new Date(createTarifaDto.hasta);

            if (desde >= hasta) {
                throw new Error('La fecha "desde" debe ser anterior a la fecha "hasta"');
            }

            const tarifa = this.tarifaRepository.create(createTarifaDto);
            return await this.tarifaRepository.save(tarifa);
        } catch (error) {
            throw new Error(`Error al crear tarifa: ${error.message}`);
        }
    }

    async update(id: number, updateTarifaDto: UpdateTarifaDto) {
        try {
            const tarifa = await this.tarifaRepository.findOne({
                where: { id },
            });

            if (!tarifa) {
                throw new Error(`Tarifa con ID ${id} no encontrada`);
            }

            // Validar fechas si se están actualizando
            if (updateTarifaDto.desde || updateTarifaDto.hasta) {
                const desde = new Date(updateTarifaDto.desde || tarifa.desde);
                const hasta = new Date(updateTarifaDto.hasta || tarifa.hasta);

                if (desde >= hasta) {
                    throw new Error('La fecha "desde" debe ser anterior a la fecha "hasta"');
                }
            }

            Object.assign(tarifa, updateTarifaDto);
            return await this.tarifaRepository.save(tarifa);
        } catch (error) {
            throw new Error(`Error al actualizar tarifa: ${error.message}`);
        }
    }

    async remove(id: number) {
        try {
            const tarifa = await this.tarifaRepository.findOne({
                where: { id },
            });

            if (!tarifa) {
                throw new Error(`Tarifa con ID ${id} no encontrada`);
            }

            await this.tarifaRepository.remove(tarifa);
            return { message: 'Tarifa eliminada exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar tarifa: ${error.message}`);
        }
    }
}

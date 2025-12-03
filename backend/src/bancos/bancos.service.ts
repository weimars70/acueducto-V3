import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from '../entities/banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Injectable()
export class BancosService {
  constructor(
    @InjectRepository(Banco)
    private readonly bancoRepository: Repository<Banco>,
  ) {}

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          id,
          codigo,
          nombre,
          numero_cuenta,
          titular,
          nit_titular,
          entidad_financiera,
          moneda,
          centro_costo_id,
          cuenta_contable,
          activa,
          observaciones,
          fecha_creacion,
          creado_por,
          tipo_cuenta,
          cuenta
        FROM public.view_bancos
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

      if (filters.codigo) {
        query += ` AND codigo ILIKE $${paramCount}`;
        queryParams.push(`%${filters.codigo}%`);
        paramCount++;
      }

      if (filters.nombre) {
        query += ` AND nombre ILIKE $${paramCount}`;
        queryParams.push(`%${filters.nombre}%`);
        paramCount++;
      }

      if (filters.numero_cuenta) {
        query += ` AND numero_cuenta ILIKE $${paramCount}`;
        queryParams.push(`%${filters.numero_cuenta}%`);
        paramCount++;
      }

      if (filters.activa !== undefined) {
        query += ` AND activa = $${paramCount}`;
        queryParams.push(filters.activa);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.bancoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY codigo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.bancoRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener bancos: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const banco = await this.bancoRepository.findOne({
        where: { id },
      });

      if (!banco) {
        throw new Error(`Banco con ID ${id} no encontrado`);
      }

      return banco;
    } catch (error) {
      throw new Error(`Error al obtener banco: ${error.message}`);
    }
  }

  async create(createBancoDto: any) {
    try {
      const empresaId = createBancoDto.empresaId;

      // Verificar duplicados por código dentro de la misma empresa
      const existingCodigo = await this.bancoRepository.findOne({
        where: {
          codigo: createBancoDto.codigo,
          // empresaId (si la entidad tiene ese campo)
        },
      });

      if (existingCodigo) {
        throw new Error('Ya existe un banco con este código');
      }

      // Verificar duplicados por número de cuenta dentro de la misma empresa
      const existingCuenta = await this.bancoRepository.findOne({
        where: {
          numero_cuenta: createBancoDto.numero_cuenta,
          // empresaId (si la entidad tiene ese campo)
        },
      });

      if (existingCuenta) {
        throw new Error('Ya existe un banco con este número de cuenta');
      }

      const banco = this.bancoRepository.create(createBancoDto);
      return await this.bancoRepository.save(banco);
    } catch (error) {
      throw new Error(`Error al crear banco: ${error.message}`);
    }
  }

  async update(id: number, updateBancoDto: UpdateBancoDto) {
    try {
      const banco = await this.bancoRepository.findOne({
        where: { id },
      });

      if (!banco) {
        throw new Error(`Banco con ID ${id} no encontrado`);
      }

      // Verificar duplicados por código si se está actualizando
      if (updateBancoDto.codigo && updateBancoDto.codigo !== banco.codigo) {
        const existingCodigo = await this.bancoRepository.findOne({
          where: { codigo: updateBancoDto.codigo },
        });

        if (existingCodigo) {
          throw new Error('Ya existe un banco con este código');
        }
      }

      // Verificar duplicados por número de cuenta si se está actualizando
      if (updateBancoDto.numero_cuenta && updateBancoDto.numero_cuenta !== banco.numero_cuenta) {
        const existingCuenta = await this.bancoRepository.findOne({
          where: { numero_cuenta: updateBancoDto.numero_cuenta },
        });

        if (existingCuenta) {
          throw new Error('Ya existe un banco con este número de cuenta');
        }
      }

      Object.assign(banco, updateBancoDto);
      return await this.bancoRepository.save(banco);
    } catch (error) {
      throw new Error(`Error al actualizar banco: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const banco = await this.bancoRepository.findOne({
        where: { id },
      });

      if (!banco) {
        throw new Error(`Banco con ID ${id} no encontrado`);
      }

      await this.bancoRepository.remove(banco);
      return { message: 'Banco eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar banco: ${error.message}`);
    }
  }
}

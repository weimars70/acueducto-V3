import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          codigo,
          fechahora,
          proveedor_ident,
          proveedor_nombre,
          forma_pago,
          plazo,
          factura,
          fecha_factura,
          total,
          subtotal,
          descuento,
          iva,
          saldo,
          total_unidades,
          anulado,
          proveedor
        FROM public.compras
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 1;

      if (filters.factura) {
        query += ` AND factura ILIKE $${paramCount}`;
        queryParams.push(`%${filters.factura}%`);
        paramCount++;
      }

      if (filters.proveedor_nombre) {
        query += ` AND proveedor_nombre ILIKE $${paramCount}`;
        queryParams.push(`%${filters.proveedor_nombre}%`);
        paramCount++;
      }

      if (filters.anulado !== undefined) {
        query += ` AND anulado = $${paramCount}`;
        queryParams.push(filters.anulado);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.compraRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` ORDER BY codigo DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.compraRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener compras: ${error.message}`);
    }
  }

  async getProveedores() {
    try {
      const query = `
        SELECT codigo, identificacion, nombre
        FROM terceros
        WHERE proveedor = true
        ORDER BY nombre
      `;
      const proveedores = await this.dataSource.query(query);
      return proveedores;
    } catch (error) {
      throw new Error(`Error al obtener proveedores: ${error.message}`);
    }
  }

  async getItems() {
    try {
      const query = `
        SELECT codigo, nombre, precio_sin_iva, por_iva, precio_total, precio_venta
        FROM public.items
        ORDER BY nombre
      `;
      const items = await this.dataSource.query(query);
      return items;
    } catch (error) {
      throw new Error(`Error al obtener items: ${error.message}`);
    }
  }

  async findOne(codigo: number) {
    try {
      const compra = await this.compraRepository.findOne({
        where: { codigo },
      });

      if (!compra) {
        throw new Error(`Compra con código ${codigo} no encontrada`);
      }

      // Obtener los detalles de la compra
      const detallesQuery = `
        SELECT
          item,
          cantidad,
          precio,
          descuento,
          iva,
          subtotal
        FROM compras_detalle
        WHERE codigo_compra = $1
      `;
      const detalles = await this.dataSource.query(detallesQuery, [codigo]);

      return {
        ...compra,
        items: detalles,
      };
    } catch (error) {
      throw new Error(`Error al obtener compra: ${error.message}`);
    }
  }

  async create(createCompraDto: CreateCompraDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Preparar datos para la función PostgreSQL
      const jsonData = {
        action: 'guardar',
        data: createCompraDto,
      };

      // Llamar a la función de PostgreSQL
      const result = await queryRunner.query(
        `SELECT public.func_guardar_compra($1::jsonb) AS resultado`,
        [JSON.stringify(jsonData)],
      );

      const respuesta = JSON.parse(result[0].resultado);

      if (!respuesta.ok) {
        throw new Error(respuesta.mensaje || 'Error al guardar la compra');
      }

      await queryRunner.commitTransaction();
      return respuesta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al crear compra: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async update(codigo: number, updateCompraDto: UpdateCompraDto) {
    try {
      const compra = await this.compraRepository.findOne({
        where: { codigo },
      });

      if (!compra) {
        throw new Error(`Compra con código ${codigo} no encontrada`);
      }

      Object.assign(compra, updateCompraDto);
      return await this.compraRepository.save(compra);
    } catch (error) {
      throw new Error(`Error al actualizar compra: ${error.message}`);
    }
  }

  async remove(codigo: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const compra = await this.compraRepository.findOne({
        where: { codigo },
      });

      if (!compra) {
        throw new Error(`Compra con código ${codigo} no encontrada`);
      }

      // Eliminar detalles
      await queryRunner.query(
        'DELETE FROM compras_detalle WHERE codigo_compra = $1',
        [codigo],
      );

      // Eliminar movimientos
      await queryRunner.query(
        'DELETE FROM compras_movimientos WHERE codigo_compra = $1',
        [codigo],
      );

      // Eliminar compra
      await this.compraRepository.remove(compra);

      await queryRunner.commitTransaction();
      return { message: 'Compra eliminada exitosamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al eliminar compra: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}

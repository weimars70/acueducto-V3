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
  ) { }

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

  async getItems(empresaId: number) {
    try {
      const query = `
        SELECT codigo, nombre, precio_sin_iva, por_iva, precio_total, precio_venta
        FROM public.items
        WHERE empresa_id = $1
        ORDER BY nombre
      `;
      const items = await this.dataSource.query(query, [empresaId]);
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

  async create(createCompraDto: CreateCompraDto, userId: number, empresaId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        proveedor,
        factura,
        forma_pago = 1,
        plazo = 0,
        fecha,
        subtotal = 0,
        descuento = 0,
        iva = 0,
        total = 0,
        items
      } = createCompraDto;

      // 1. Validations
      if (!proveedor) {
        throw new Error('Debe indicar un proveedor');
      }

      if (!items || items.length === 0) {
        throw new Error('Debe agregar al menos un ítem');
      }

      // 2. Get Proveedor Details (replacing func_ident_tercero and func_nombre_tercero)
      const proveedorData = await queryRunner.query(
        'SELECT identificacion, nombre FROM public.terceros WHERE codigo = $1',
        [proveedor]
      );

      const proveedorIdent = proveedorData[0]?.identificacion || '';
      const proveedorNombre = proveedorData[0]?.nombre || '';

      // 3. Insert Cabecera (Compras)
      // Note: Added empresa_id and usuario_graduador (mapped from userId)
      const insertCompraResult = await queryRunner.query(
        `INSERT INTO public.compras (
          proveedor, proveedor_ident, proveedor_nombre, factura, forma_pago, 
          plazo, fecha_factura, subtotal, descuento, iva, total, 
          empresa_id, usuario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING codigo`,
        [
          proveedor,
          proveedorIdent,
          proveedorNombre,
          factura,
          forma_pago,
          plazo,
          fecha,
          subtotal,
          descuento,
          iva,
          total,
          empresaId,
          userId
        ]
      );

      const codigoCompra = insertCompraResult[0].codigo;

      // 4. Loop Items
      for (const item of items) {
        // Get Item Details (replacing func_nombre_item and func_id_item)
        // Assuming item.codigo is the ID or Code. 
        // Based on func_guardar_compra: 
        // func_nombre_item(v_item->>'codigo')
        // func_id_item((v_item->>'codigo')) -> Insert into movimientos_inventario uses this.
        // If item.codigo IS the id, we use it directly. If it's a string code, we fetch ID.
        // Let's assume item.codigo is the PK for now based on typical DTOs, 
        // OR fetch it if needed. usage: `SELECT nombre FROM items WHERE codigo = ...`

        const itemData = await queryRunner.query(
          'SELECT id, codigo, nombre FROM public.items WHERE codigo = $1 AND empresa_id = $2',
          [item.codigo, empresaId]
        );

        if (!itemData || itemData.length === 0) {
          throw new Error(`Item con código ${item.codigo} no encontrado`);
        }

        const itemId = itemData[0].id;
        const itemCodigo = itemData[0].codigo;
        const itemNombre = itemData[0].nombre;

        // Insert Detalle
        await queryRunner.query(
          `INSERT INTO public.compras_detalle (
            codigo_compra, item, item_descripcion, iva, precio,
            descuento, cantidad, subtotal,
            empresa_id, usuario
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            codigoCompra,
            itemCodigo,
            itemNombre,
            item.por_iva || 0,
            item.pcompra || 0,
            item.descuento || 0,
            item.cantidad || 0,
            item.subtotal || 0,
            empresaId,
            userId
          ]
        );

        // Insert Movimiento Inventario
        await queryRunner.query(
          `INSERT INTO public.movimientos_inventario (
            id_item, tipo_movimiento, cantidad, fecha_movimiento,
            observaciones, fecha_registro, empresa_id, usuario
          ) VALUES ($1, 1, $2, $3, 'compras', CURRENT_DATE, $4, $5)`,
          [
            itemId,
            item.cantidad || 0,
            fecha,
            empresaId,
            userId
          ]
        );

        // Actualizar inventario actual en items (sumar cantidad de compra)
        await queryRunner.query(
          `UPDATE public.items
          SET inventario_actual = inventario_actual + $1
          WHERE id = $2 AND empresa_id = $3`,
          [
            item.cantidad || 0,
            itemId,
            empresaId
          ]
        );
      }

      // 5. Insert Movimiento Contable (Compras Movimientos)
      // Logic: INSERT INTO compras_movimientos (codigo_compra, factura, credito, fecha)
      await queryRunner.query(
        `INSERT INTO public.compras_movimientos (
          codigo_compra, factura, credito, fecha, empresa_id, usuario
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          codigoCompra,
          factura,
          total,
          fecha,
          empresaId,
          userId
        ]
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        mensaje: 'Compra guardada correctamente',
        codigo_compra: codigoCompra
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in create compra transaction:', error);
      // Simplify error message for frontend
      throw new Error(error.message || 'Error al guardar la compra');
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

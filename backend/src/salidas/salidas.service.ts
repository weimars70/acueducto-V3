import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Salida } from '../entities/salida.entity';
import { CreateSalidaDto } from './dto/create-salida.dto';

@Injectable()
export class SalidasService {
    constructor(
        @InjectRepository(Salida)
        private salidaRepository: Repository<Salida>,
        private readonly dataSource: DataSource,
    ) { }

    async findAll(empresaId: number): Promise<Salida[]> {
        return await this.salidaRepository.find({
            where: { empresaId: empresaId },
            order: { fechahora: 'DESC' },
        });
    }

    async getClientes(empresaId: number) {
        try {
            const query = `
                SELECT codigo, identificacion, nombre
                FROM terceros
                WHERE activo = true
                  AND cliente = true
                  AND empresa_id = $1
                ORDER BY nombre
                LIMIT 100
            `;
            const clientes = await this.dataSource.query(query, [empresaId]);
            return clientes;
        } catch (error) {
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }
    }

    async searchClientes(searchQuery: string, empresaId: number) {
        try {
            if (!searchQuery || searchQuery.length < 3) {
                return [];
            }

            const query = `
                SELECT codigo, identificacion, nombre
                FROM terceros
                WHERE activo = true
                  AND cliente = true
                  AND empresa_id = $1
                  AND (
                    LOWER(nombre) LIKE LOWER($2)
                    OR LOWER(identificacion) LIKE LOWER($2)
                  )
                ORDER BY nombre
                LIMIT 50
            `;
            const clientes = await this.dataSource.query(query, [empresaId, `%${searchQuery}%`]);
            return clientes;
        } catch (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    async getItems() {
        try {
            const query = `
                SELECT codigo, nombre, precio_sin_iva, por_iva, precio_total, precio_venta
                FROM public.items
                ORDER BY nombre
                LIMIT 100
            `;
            const items = await this.dataSource.query(query);
            return items;
        } catch (error) {
            throw new Error(`Error al obtener items: ${error.message}`);
        }
    }

    async searchItems(searchQuery: string, empresaId: number) {
        try {
            if (!searchQuery || searchQuery.length < 3) {
                return [];
            }

            const query = `
                SELECT codigo, nombre, precio_sin_iva, por_iva, precio_total, precio_venta
                FROM public.items
                WHERE empresa_id = $1
                  AND (
                    LOWER(nombre) LIKE LOWER($2)
                    OR LOWER(codigo) LIKE LOWER($2)
                  )
                ORDER BY nombre
                LIMIT 50
            `;
            const items = await this.dataSource.query(query, [empresaId, `%${searchQuery}%`]);
            return items;
        } catch (error) {
            throw new Error(`Error al buscar items: ${error.message}`);
        }
    }

    async create(createSalidaDto: CreateSalidaDto, userId: number, empresaId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                cliente,
                plazo = 0,
                fecha,
                subtotal = 0,
                descuento = 0,
                iva = 0,
                total = 0,
                obs,
                items
            } = createSalidaDto;

            // 1. Validaciones
            if (!cliente) {
                throw new Error('Debe indicar un cliente');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe agregar al menos un ítem');
            }

            // 2. Obtener datos del cliente
            const clienteData = await queryRunner.query(
                'SELECT identificacion, nombre FROM terceros WHERE codigo = $1',
                [cliente]
            );

            const clienteIdent = clienteData[0]?.identificacion || '';
            const clienteNombre = clienteData[0]?.nombre || '';

            // 3. Generar código de factura (siguiente número)
            const maxCodigoResult = await queryRunner.query(
                'SELECT COALESCE(MAX(codigo), 0) as max_codigo FROM salidas'
            );
            const factura = String(maxCodigoResult[0].max_codigo);

            // 4. Insertar cabecera (salidas)
            const insertSalidaResult = await queryRunner.query(
                `INSERT INTO salidas (
                    cliente, cliente_ident, cliente_nombre, factura, forma_pago,
                    plazo, fecha_factura, subtotal, descuento, iva, total,
                    observacion, empresa_id, usuario
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING codigo`,
                [
                    cliente,
                    clienteIdent,
                    clienteNombre,
                    factura,
                    0, // forma_pago
                    plazo,
                    fecha,
                    subtotal,
                    descuento,
                    iva,
                    total,
                    obs,
                    empresaId,
                    userId
                ]
            );

            const codigoSalida = insertSalidaResult[0].codigo;

            // 5. Loop Items - Insertar detalle y movimientos
            for (const item of items) {
                // Obtener nombre del item
                const itemData = await queryRunner.query(
                    'SELECT codigo, nombre FROM items WHERE codigo = $1',
                    [item.codigo]
                );

                const itemNombre = itemData[0]?.nombre || '';
                const itemId = itemData[0]?.codigo || item.codigo;

                // Insertar detalle
                await queryRunner.query(
                    `INSERT INTO salidas_detalle (
                        codigo_salida, item, item_descripcion, iva, precio,
                        descuento, cantidad, subtotal, empresa_id, usuario
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        codigoSalida,
                        item.codigo,
                        itemNombre,
                        item.por_iva || 0,
                        item.psalida || 0,
                        item.descuento || 0,
                        item.cantidad || 0,
                        item.subtotal || 0,
                        empresaId,
                        userId
                    ]
                );

                // Insertar movimiento de inventario (tipo_movimiento = 2 para salidas)
                await queryRunner.query(
                    `INSERT INTO movimientos_inventario (
                        id_item, tipo_movimiento, cantidad, fecha_movimiento,
                        observaciones, fecha_registro, empresa_id, usuario
                    ) VALUES ($1, 2, $2, $3, 'salidas', CURRENT_DATE, $4, $5)`,
                    [
                        itemId,
                        item.cantidad || 0,
                        fecha,
                        empresaId,
                        userId
                    ]
                );
            }

            // 6. Insertar movimiento contable
            await queryRunner.query(
                `INSERT INTO salidas_movimientos (
                    codigo_salida, factura, credito, fecha, empresa_id, usuario
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    codigoSalida,
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
                mensaje: 'Salida guardada correctamente',
                codigo_salida: codigoSalida
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error al guardar salida:', error);
            throw new Error(error.message || 'Error al guardar la salida');
        } finally {
            await queryRunner.release();
        }
    }
}

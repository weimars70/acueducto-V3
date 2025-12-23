import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AjusteInventario } from '../entities/ajuste-inventario.entity';
import { CreateAjusteInventarioDto } from './dto/create-ajuste-inventario.dto';
import { CreateAjusteMultipleDto } from './dto/create-ajuste-multiple.dto';
import { TiposAjusteInventarioService } from '../tipos-ajuste-inventario/tipos-ajuste-inventario.service';

@Injectable()
export class AjustesInventarioService {
    constructor(
        @InjectRepository(AjusteInventario)
        private ajusteInventarioRepository: Repository<AjusteInventario>,
        private readonly dataSource: DataSource,
        private readonly tiposAjusteService: TiposAjusteInventarioService,
    ) { }

    async findAll(empresaId: number, page: number = 1, limit: number = 20, filters: Record<string, any> = {}) {
        try {
            console.log('=== FILTROS RECIBIDOS ===');
            console.log('Filters:', JSON.stringify(filters, null, 2));
            console.log('Empresa ID:', empresaId);
            console.log('Page:', page, 'Limit:', limit);

            let query = `
                SELECT
                    ai.id,
                    ai.id_item,
                    ai.item_codigo,
                    ai.item_nombre,
                    ai.tipo_ajuste,
                    ai.cantidad,
                    ai.inventario_anterior,
                    ai.inventario_nuevo,
                    ai.motivo,
                    ai.fecha,
                    COALESCE(u.email, u.name) as usuario
                FROM ajustes_inventario ai
                LEFT JOIN usuarios u ON ai.usuario::integer = u.id
                WHERE ai.empresa_id = $1
            `;

            const queryParams: any[] = [empresaId];
            let paramCount = 2;

            if (filters.itemNombre) {
                query += ` AND (ai.item_nombre ILIKE $${paramCount} OR ai.item_codigo ILIKE $${paramCount})`;
                queryParams.push(`%${filters.itemNombre}%`);
                paramCount++;
            }

            if (filters.tipoAjuste) {
                query += ` AND ai.tipo_ajuste = $${paramCount}`;
                queryParams.push(filters.tipoAjuste);
                paramCount++;
            }

            if (filters.fechaDesde && filters.fechaDesde.trim()) {
                const fechaDesdeValue = filters.fechaDesde.trim() + ' 00:00:00';
                query += ` AND ai.fecha >= $${paramCount}::timestamp`;
                queryParams.push(fechaDesdeValue);
                console.log(`Filtro fechaDesde agregado: $${paramCount} = ${fechaDesdeValue}`);
                paramCount++;
            }

            if (filters.fechaHasta && filters.fechaHasta.trim()) {
                const fechaHastaValue = filters.fechaHasta.trim() + ' 23:59:59';
                query += ` AND ai.fecha <= $${paramCount}::timestamp`;
                queryParams.push(fechaHastaValue);
                console.log(`Filtro fechaHasta agregado: $${paramCount} = ${fechaHastaValue}`);
                paramCount++;
            }

            // Obtener el total de registros
            const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
            console.log('\n=== CONSULTA COUNT ===');
            console.log(countQuery);
            console.log('Parámetros:', queryParams);

            const totalResult = await this.dataSource.query(countQuery, queryParams);
            const total = parseInt(totalResult[0].count);
            console.log('Total de registros encontrados:', total);

            // Agregar ordenamiento y paginación
            query += ` ORDER BY ai.fecha DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, (page - 1) * limit);

            console.log('\n=== CONSULTA FINAL ===');
            console.log(query);
            console.log('Parámetros:', queryParams);

            const data = await this.dataSource.query(query, queryParams);
            console.log('Registros retornados:', data.length);
            console.log('===========================\n');

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new Error(`Error al obtener ajustes: ${error.message}`);
        }
    }

    async getItems(empresaId: number, searchQuery?: string) {
        try {
            let query = `
                SELECT id, codigo, nombre, inventario_actual
                FROM public.items
                WHERE empresa_id = $1
            `;
            const params: any[] = [empresaId];

            if (searchQuery && searchQuery.length >= 3) {
                query += ` AND (LOWER(nombre) LIKE LOWER($2) OR LOWER(codigo) LIKE LOWER($2))`;
                params.push(`%${searchQuery}%`);
            }

            query += ` ORDER BY nombre LIMIT 50`;

            const items = await this.dataSource.query(query, params);
            return items;
        } catch (error) {
            throw new Error(`Error al obtener items: ${error.message}`);
        }
    }

    async create(createAjusteDto: CreateAjusteInventarioDto, userId: string, empresaId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { idItem, tipoAjuste, cantidad, motivo } = createAjusteDto;

            // 1. Validaciones
            if (!idItem) {
                throw new Error('Debe seleccionar un item');
            }

            if (!tipoAjuste || (tipoAjuste !== '+' && tipoAjuste !== '-' && tipoAjuste !== 'inicial')) {
                throw new Error('Tipo de ajuste inválido');
            }

            if (tipoAjuste === 'inicial' && (!cantidad || cantidad < 0)) {
                throw new Error('La cantidad debe ser mayor o igual a cero');
            } else if (!cantidad || cantidad <= 0) {
                throw new Error('La cantidad debe ser mayor a cero');
            }

            // 2. Obtener datos del item
            const itemData = await queryRunner.query(
                'SELECT id, codigo, nombre, inventario_actual FROM items WHERE id = $1 AND empresa_id = $2',
                [idItem, empresaId]
            );

            if (!itemData || itemData.length === 0) {
                throw new Error('Item no encontrado');
            }

            const item = itemData[0];
            const inventarioAnterior = parseFloat(item.inventario_actual) || 0;

            // 3. Calcular nuevo inventario
            let inventarioNuevo = inventarioAnterior;
            if (tipoAjuste === 'inicial') {
                // Para inventario inicial, establecer directamente el valor
                inventarioNuevo = cantidad;
            } else if (tipoAjuste === '+') {
                inventarioNuevo = inventarioAnterior + cantidad;
            } else {
                inventarioNuevo = inventarioAnterior - cantidad;
            }

            // Validar que no quede negativo (excepto para inventario inicial que puede ser cualquier valor)
            if (tipoAjuste !== 'inicial' && inventarioNuevo < 0) {
                throw new Error('El ajuste resultaría en inventario negativo');
            }

            // 4. Actualizar inventario del item
            await queryRunner.query(
                `UPDATE public.items
                SET inventario_actual = $1
                WHERE id = $2 AND empresa_id = $3`,
                [inventarioNuevo, idItem, empresaId]
            );

            // 5. Insertar registro de ajuste
            const insertResult = await queryRunner.query(
                `INSERT INTO ajustes_inventario (
                    id_item, item_codigo, item_nombre, tipo_ajuste,
                    cantidad, inventario_anterior, inventario_nuevo,
                    motivo, usuario, empresa_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id`,
                [
                    idItem,
                    item.codigo,
                    item.nombre,
                    tipoAjuste,
                    cantidad,
                    inventarioAnterior,
                    inventarioNuevo,
                    motivo || '',
                    userId,
                    empresaId
                ]
            );

            // 6. Insertar movimiento de inventario
            let tipoMovimiento: number;
            if (tipoAjuste === 'inicial') {
                tipoMovimiento = 5; // 5=inventario inicial
            } else if (tipoAjuste === '+') {
                tipoMovimiento = 3; // 3=ajuste entrada
            } else {
                tipoMovimiento = 4; // 4=ajuste salida
            }

            await queryRunner.query(
                `INSERT INTO movimientos_inventario (
                    id_item, tipo_movimiento, cantidad, fecha_movimiento,
                    observaciones, fecha_registro, empresa_id, usuario
                ) VALUES ($1, $2, $3, CURRENT_DATE, $4, CURRENT_DATE, $5, $6)`,
                [
                    idItem,
                    tipoMovimiento,
                    cantidad,
                    motivo || (tipoAjuste === 'inicial' ? 'Inventario inicial' : 'Ajuste de inventario'),
                    empresaId,
                    userId
                ]
            );

            await queryRunner.commitTransaction();

            return {
                ok: true,
                mensaje: 'Ajuste de inventario guardado correctamente',
                id: insertResult[0].id,
                inventarioAnterior,
                inventarioNuevo
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error al crear ajuste:', error);
            throw new Error(error.message || 'Error al guardar el ajuste');
        } finally {
            await queryRunner.release();
        }
    }

    async getEstadisticas(empresaId: number) {
        try {
            const query = `
                SELECT
                    COUNT(*) as total_ajustes,
                    SUM(CASE WHEN tipo_ajuste = '+' THEN cantidad ELSE 0 END) as total_entradas,
                    SUM(CASE WHEN tipo_ajuste = '-' THEN cantidad ELSE 0 END) as total_salidas
                FROM ajustes_inventario
                WHERE empresa_id = $1
            `;
            const result = await this.dataSource.query(query, [empresaId]);
            return result[0];
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    async createMultiple(createMultipleDto: CreateAjusteMultipleDto, userId: string, empresaId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { codigoTipoAjuste, items, motivoGeneral } = createMultipleDto;

            // 1. Obtener tipo de ajuste
            const tipoAjuste = await this.tiposAjusteService.findOne(codigoTipoAjuste);

            if (!tipoAjuste || !tipoAjuste.activo) {
                throw new Error('Tipo de ajuste no válido o inactivo');
            }

            const ajustesRealizados = [];

            // 2. Procesar cada item
            for (const itemDto of items) {
                const { idItem, cantidad, motivo } = itemDto;

                // 2.1 Validaciones
                if (!idItem) {
                    throw new Error('Debe especificar un item válido');
                }

                if (tipoAjuste.valorUnidades) {
                    // Para valor unidades, aceptar >= 0
                    if (cantidad < 0) {
                        throw new Error('La cantidad debe ser mayor o igual a cero');
                    }
                } else {
                    // Para suma/resta, debe ser > 0
                    if (cantidad <= 0) {
                        throw new Error('La cantidad debe ser mayor a cero');
                    }
                }

                // 2.2 Obtener datos del item
                const itemData = await queryRunner.query(
                    'SELECT id, codigo, nombre, inventario_actual FROM items WHERE id = $1 AND empresa_id = $2',
                    [idItem, empresaId]
                );

                if (!itemData || itemData.length === 0) {
                    throw new Error(`Item con ID ${idItem} no encontrado`);
                }

                const item = itemData[0];
                const inventarioAnterior = parseFloat(item.inventario_actual) || 0;

                // 2.3 Calcular nuevo inventario según el tipo
                let inventarioNuevo = inventarioAnterior;
                if (tipoAjuste.sumaUnidades) {
                    inventarioNuevo = inventarioAnterior + cantidad;
                } else if (tipoAjuste.restaUnidades) {
                    inventarioNuevo = inventarioAnterior - cantidad;
                    // Validar que no quede negativo
                    if (inventarioNuevo < 0) {
                        throw new Error(`El ajuste del item ${item.nombre} resultaría en inventario negativo`);
                    }
                } else if (tipoAjuste.valorUnidades) {
                    inventarioNuevo = cantidad;
                }

                // 2.4 Actualizar inventario del item
                await queryRunner.query(
                    `UPDATE public.items
                    SET inventario_actual = $1
                    WHERE id = $2 AND empresa_id = $3`,
                    [inventarioNuevo, idItem, empresaId]
                );

                // 2.5 Determinar tipo_ajuste legacy para compatibilidad
                let tipoAjusteLegacy: string;
                if (tipoAjuste.sumaUnidades) {
                    tipoAjusteLegacy = '+';
                } else if (tipoAjuste.restaUnidades) {
                    tipoAjusteLegacy = '-';
                } else {
                    tipoAjusteLegacy = 'inicial';
                }

                // 2.6 Insertar registro de ajuste
                const motivoFinal = motivo || motivoGeneral || '';
                const insertResult = await queryRunner.query(
                    `INSERT INTO ajustes_inventario (
                        id_item, item_codigo, item_nombre, tipo_ajuste, codigo_tipo_ajuste,
                        cantidad, inventario_anterior, inventario_nuevo,
                        motivo, usuario, empresa_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id`,
                    [
                        idItem,
                        item.codigo,
                        item.nombre,
                        tipoAjusteLegacy,
                        codigoTipoAjuste,
                        cantidad,
                        inventarioAnterior,
                        inventarioNuevo,
                        motivoFinal,
                        userId,
                        empresaId
                    ]
                );

                // 2.7 Insertar movimiento de inventario
                let tipoMovimiento: number;
                if (tipoAjuste.valorUnidades) {
                    tipoMovimiento = 5; // 5=inventario inicial
                } else if (tipoAjuste.sumaUnidades) {
                    tipoMovimiento = 3; // 3=ajuste entrada
                } else {
                    tipoMovimiento = 4; // 4=ajuste salida
                }

                await queryRunner.query(
                    `INSERT INTO movimientos_inventario (
                        id_item, tipo_movimiento, cantidad, fecha_movimiento,
                        observaciones, fecha_registro, empresa_id, usuario
                    ) VALUES ($1, $2, $3, CURRENT_DATE, $4, CURRENT_DATE, $5, $6)`,
                    [
                        idItem,
                        tipoMovimiento,
                        cantidad,
                        `${tipoAjuste.nombre} - ${motivoFinal}`,
                        empresaId,
                        userId
                    ]
                );

                ajustesRealizados.push({
                    id: insertResult[0].id,
                    itemNombre: item.nombre,
                    inventarioAnterior,
                    inventarioNuevo,
                    cantidad
                });
            }

            await queryRunner.commitTransaction();

            return {
                ok: true,
                mensaje: `Se guardaron ${ajustesRealizados.length} ajuste(s) correctamente`,
                ajustes: ajustesRealizados
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error al crear ajustes múltiples:', error);
            throw new Error(error.message || 'Error al guardar los ajustes');
        } finally {
            await queryRunner.release();
        }
    }
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('ajustes_inventario')
export class AjusteInventario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_item', type: 'int4' })
    idItem: number;

    @Column({ name: 'item_codigo', type: 'text', nullable: true })
    itemCodigo: string;

    @Column({ name: 'item_nombre', type: 'text' })
    itemNombre: string;

    @Column({ name: 'tipo_ajuste', type: 'varchar', length: 10 })
    tipoAjuste: string; // '+' para entrada, '-' para salida

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    cantidad: number;

    @Column({ name: 'inventario_anterior', type: 'numeric', precision: 12, scale: 2 })
    inventarioAnterior: number;

    @Column({ name: 'inventario_nuevo', type: 'numeric', precision: 12, scale: 2 })
    inventarioNuevo: number;

    @Column({ type: 'text', nullable: true })
    motivo: string;

    @CreateDateColumn({ name: 'fecha', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ type: 'text' })
    usuario: string;

    @Column({ name: 'empresa_id', type: 'int4' })
    empresaId: number;
}

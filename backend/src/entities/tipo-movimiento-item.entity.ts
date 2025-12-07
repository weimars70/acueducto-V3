import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_movimiento_item')
export class TipoMovimientoItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

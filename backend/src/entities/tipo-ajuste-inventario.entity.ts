import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tipos_ajuste_inventario')
export class TipoAjusteInventario {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ type: 'text', unique: true })
    nombre: string;

    @Column({ name: 'suma_unidades', type: 'boolean', default: false })
    sumaUnidades: boolean;

    @Column({ name: 'resta_unidades', type: 'boolean', default: false })
    restaUnidades: boolean;

    @Column({ name: 'valor_unidades', type: 'boolean', default: false })
    valorUnidades: boolean;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}

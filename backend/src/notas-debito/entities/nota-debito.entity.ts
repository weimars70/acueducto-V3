import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notas_debito')
export class NotaDebito {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ name: 'instalacion_codigo' })
    instalacionCodigo: number;

    @Column({ name: 'cliente_nombre', nullable: true })
    clienteNombre: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    valor: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    disponible: number;

    @Column()
    concepto: number;

    @Column({ nullable: true })
    observacion: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ nullable: true })
    usuario: string;
}

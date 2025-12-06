import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('conceptos_factura')
export class ConceptoFactura {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ type: 'text', nullable: true })
    usuario: string;

    @Column({ name: 'usar_diferido', default: false })
    usarDiferido: boolean;
}

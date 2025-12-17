import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('notas_conceptos')
export class NotaConcepto {
    @PrimaryColumn()
    codigo: number;

    @PrimaryColumn({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

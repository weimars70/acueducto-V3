import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('years')
export class Years {
    @PrimaryColumn()
    year: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;
}

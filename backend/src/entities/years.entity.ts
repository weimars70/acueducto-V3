import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('years')
export class Years {
    @PrimaryColumn()
    year: number;

    @Column({ name: 'empresa_id' })
    empresa_id: number;

    @Column({ nullable: true })
    usuario: string;
}

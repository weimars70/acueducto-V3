import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('estratos_tarifas')
export class EstratoTarifa {
    @PrimaryColumn()
    codigo: number; // FK -> estratos?

    @PrimaryColumn()
    tipo: number; // FK -> estratos_tipo?

    @Column({ default: '0' })
    estrato: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    cargo: number;

    @Column({ name: 'm3_0_20', type: 'numeric', precision: 12, scale: 2, default: 0 })
    m3_0_20: number;

    @Column({ name: 'm3_21_40', type: 'numeric', precision: 12, scale: 2, default: 0 })
    m3_21_40: number;

    @Column({ name: 'm3_41_x', type: 'numeric', precision: 12, scale: 2, default: 0 })
    m3_41_x: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 1 })
    interes: number;

    @Column({ name: 'subsidio_cargo_fijo', type: 'numeric', precision: 12, scale: 2, default: 0 })
    subsidioCargoFijo: number;

    @Column({ name: 'subsidio_consumo', type: 'numeric', precision: 12, scale: 2, default: 0 })
    subsidioConsumo: number;

    @Column({ name: 'subsidio_consumo_complementario', type: 'numeric', precision: 12, scale: 2, default: 0 })
    subsidioConsumoComplementario: number;

    @Column({ name: 'subsidio_consumo_suntuario', type: 'numeric', precision: 12, scale: 2, default: 0 })
    subsidioConsumoSuntuario: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ nullable: true })
    usuario: string;

    // Optional id field if strictly needed for UI, but PK is composite
    @Column({ generated: 'increment', unique: true })
    id: number;
}

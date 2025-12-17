import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('conceptos_nomina')
export class ConceptoNomina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 20 })
  tipo: string; // DEVENGADO, DEDUCCION

  @Column({ length: 30, nullable: true })
  subtipo: string; // BASICO, HORA_EXTRA_DIURNA, HORA_EXTRA_FESTIVA, etc.

  @Column({ type: 'text', nullable: true })
  formula: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentaje: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}

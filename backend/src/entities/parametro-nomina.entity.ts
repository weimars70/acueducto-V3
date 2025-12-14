import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('parametros_nomina')
export class ParametroNomina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor: number;

  @Column()
  anio: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuarioCreacion: number;
}


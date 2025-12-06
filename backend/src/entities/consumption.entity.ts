import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('consumo')
export class Consumption {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column()
  instalacion: number;

  @Column()
  lectura: number;

  @Column()
  fecha: Date;

  @Column()
  consumo: number;

  @Column()
  mes: number;

  @Column()
  year: number;

  @Column()
  medidor: string;

  @Column({ name: 'otros_cobros', default: 0 })
  otrosCobros: number;

  @Column({ default: 0 })
  reconexion: number;

  @Column()
  usuario: string;

  @Column({ type: 'float', nullable: true })
  latitud: number;

  @Column({ type: 'float', nullable: true })
  longitud: number;

  @Column({ default: false })
  facturada: boolean;

  @Column({ name: 'consumo_facturar', type: 'numeric', nullable: true })
  consumoFacturar: number;
}

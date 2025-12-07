import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  codigo: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fechahora' })
  fechahora: Date;

  @Column({ type: 'varchar', length: 20, name: 'proveedor_ident', nullable: true })
  proveedorIdent: string;

  @Column({ type: 'varchar', length: 255, name: 'proveedor_nombre', nullable: true })
  proveedorNombre: string;

  @Column({ type: 'int', name: 'forma_pago', nullable: true })
  formaPago: number;

  @Column({ type: 'int', nullable: true })
  plazo: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  factura: string;

  @Column({ type: 'date', name: 'fecha_factura', nullable: true })
  fechaFactura: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, default: 0 })
  iva: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, default: 0 })
  saldo: number;

  @Column({ type: 'int', name: 'total_unidades', nullable: true, default: 0 })
  totalUnidades: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  anulado: boolean;

  @Column({ type: 'int', nullable: true })
  proveedor: number;
}

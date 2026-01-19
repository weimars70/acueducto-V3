import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('formas_pagos')
export class FormaPago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;
}

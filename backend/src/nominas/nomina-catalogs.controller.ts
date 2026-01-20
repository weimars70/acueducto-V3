import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';

@Controller('nomina-catalogs')
@UseGuards(JwtAuthGuard)
export class NominaCatalogsController {
    constructor(private dataSource: DataSource) { }

    @Get('tipo-trabajador')
    async getTipoTrabajador(@Request() req) {
        return this.dataSource.query(
            'SELECT id_tipo_trabajador as id, descripcion as nombre FROM tipo_trabajador WHERE empresa_id = $1 ORDER BY descripcion ASC',
            [req.user.empresaId]
        );
    }

    @Get('subtipo-trabajador')
    async getSubtipoTrabajador(@Request() req) {
        return this.dataSource.query(
            'SELECT id_subtipo_trabajador as id, descripcion as nombre FROM subtipo_trabajador WHERE empresa_id = $1 ORDER BY descripcion ASC',
            [req.user.empresaId]
        );
    }

    @Get('tipo-contrato')
    async getTipoContrato(@Request() req) {
        return this.dataSource.query(
            'SELECT id, nombre FROM tipo_contrato WHERE empresa_id = $1 ORDER BY nombre ASC',
            [req.user.empresaId]
        );
    }

    @Get('formas-pagos')
    async getFormasPagos(@Request() req) {
        return this.dataSource.query(
            'SELECT codigo as id, descripcion as nombre FROM formas_pagos WHERE empresa_id = $1 ORDER BY descripcion ASC',
            [req.user.empresaId]
        );
    }

    @Get('tipo-cuenta')
    async getTipoCuenta(@Request() req) {
        return this.dataSource.query(
            'SELECT id, nombre FROM tipo_cuenta WHERE empresa_id = $1 ORDER BY nombre ASC',
            [req.user.empresaId]
        );
    }

    @Get('payroll-periods')
    async getPayrollPeriods() {
        return this.dataSource.query(
            'SELECT id, name as nombre FROM payroll_periods ORDER BY name ASC'
        );
    }
}

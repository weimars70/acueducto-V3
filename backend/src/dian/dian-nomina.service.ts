import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Nomina } from '../entities/nomina.entity';
import { Empresa } from '../entities/empresa.entity';

@Injectable()
export class DianNominaService {
    constructor(
        @InjectRepository(Nomina)
        private readonly nominaRepository: Repository<Nomina>,
        @InjectRepository(Empresa)
        private readonly empresaRepository: Repository<Empresa>,
        private readonly dataSource: DataSource,
    ) { }

    async generatePayrollJson(nominaId: number) {
        const nomina = await this.nominaRepository.findOne({
            where: { id: nominaId },
            relations: ['empleado', 'periodo', 'detalles', 'detalles.concepto'],
        });

        if (!nomina) {
            throw new NotFoundException('Nómina no encontrada');
        }

        const empresa = await this.empresaRepository.findOne({
            where: { id: nomina.empresaId },
        });

        if (!empresa) {
            throw new NotFoundException('Empresa no encontrada');
        }

        // Get detailed employee data from view
        const [empleadoDetallado] = await this.dataSource.query(
            'SELECT * FROM view_empleados_detallados WHERE id = $1',
            [nomina.empleadoId],
        );

        // Get detailed mappings
        const [formaPago] = await this.dataSource.query(
            'SELECT codigo_dian FROM formas_pagos WHERE codigo = $1 AND empresa_id = $2',
            [empleadoDetallado?.metodo_pago_id, nomina.empresaId]
        );

        const [municipioEmpresa] = await this.dataSource.query(
            'SELECT establishment_municipality FROM ciudades WHERE nombre ILIKE $1 OR codigo::text = $2 LIMIT 1',
            [empresa.direccion.split(',').pop()?.trim(), empresa.municipioId]
        );

        const [municipioTrabajador] = await this.dataSource.query(
            'SELECT establishment_municipality FROM ciudades WHERE codigo::text = $1 LIMIT 1',
            [empleadoDetallado?.municipio_id]
        );

        // Frequency mapping (from period.id_payroll_periods and payroll_periods table)
        const [periodType] = await this.dataSource.query(
            'SELECT code FROM payroll_periods WHERE id = $1 LIMIT 1',
            [nomina.periodo.idPayrollPeriods]
        );

        let payroll_period_id = 4; // Default Mensual (DIAN 4)
        if (periodType?.code) {
            // If your table code is '5' for Mensual and '4' for Quincenal, but DIAN wants 4 and 5...
            // Let's map them carefully.
            const code = periodType.code.toString();
            if (code === '5') payroll_period_id = 4; // Mensual
            else if (code === '4') payroll_period_id = 5; // Quincenal
            else payroll_period_id = parseInt(code); // Others if they match
        }

        // Identification mapping from tipo_ident table (per company)
        const [tipoDocEmpresa] = await this.dataSource.query(
            'SELECT id_dian FROM tipo_ident WHERE codigo = $1 AND empresa_id = $2',
            [empresa.tipoDocumentoId, empresa.id]
        );

        const [tipoDocTrabajador] = await this.dataSource.query(
            'SELECT id_dian FROM tipo_ident WHERE codigo = $1 AND empresa_id = $2',
            [nomina.empleado.tipo_documento_id, nomina.empresaId]
        );

        const company_type_document_id = tipoDocEmpresa?.id_dian || empresa.tipoDocumentoId || 6;
        const worker_type_document_id = tipoDocTrabajador?.id_dian || 13;

        // Filter details by type
        const detalles = nomina.detalles || [];
        const baseDetalle = detalles.find(d => d.concepto?.subtipo === 'BASICO');
        const auxTransporte = detalles.find(d => d.concepto?.subtipo === 'AUXILIO_TRANSPORTE');
        const salud = detalles.find(d => d.concepto?.subtipo === 'DEDUCCION_SALUD');
        const pension = detalles.find(d => d.concepto?.subtipo === 'DEDUCCION_PENSION');

        const heDiurnas = detalles.filter(d => d.concepto?.subtipo === 'HORA_EXTRA_DIURNA');
        const heFestivas = detalles.filter(d => d.concepto?.subtipo === 'HORA_EXTRA_FESTIVA');

        // Others
        const otrosDevengados = detalles.filter(d =>
            d.concepto?.tipo === 'DEVENGADO' &&
            !['BASICO', 'AUXILIO_TRANSPORTE', 'HORA_EXTRA_DIURNA', 'HORA_EXTRA_FESTIVA'].includes(d.concepto?.subtipo)
        );

        const otrasDeducciones = detalles.filter(d =>
            d.concepto?.tipo === 'DEDUCCION' &&
            !['DEDUCCION_SALUD', 'DEDUCCION_PENSION'].includes(d.concepto?.subtipo)
        );

        // Map to DIAN Format

        // Initialize mapped structures
        const accruedItems = {
            worked_days: nomina.diasPagados,
            salary: Number(baseDetalle?.valorTotal || 0).toFixed(2),
            transportation_allowance: Number(auxTransporte?.valorTotal || 0).toFixed(2),
            HEDs: heDiurnas.map(he => {
                const start = new Date(nomina.periodo.fecha_inicio);
                start.setHours(8, 0, 0);
                const end = new Date(start);
                end.setHours(start.getHours() + Math.ceil(he.cantidad));
                return {
                    start_time: start.toISOString().replace('.000Z', '').replace('Z', ''),
                    end_time: end.toISOString().replace('.000Z', '').replace('Z', ''),
                    quantity: Number(he.cantidad),
                    percentage: 1, // ID 1 = Hora Extra Diurna
                    payment: Number(he.valorTotal).toFixed(2)
                };
            }),
            HEDDFs: heFestivas.map(he => {
                const start = new Date(nomina.periodo.fecha_inicio);
                start.setHours(8, 0, 0);
                const end = new Date(start);
                end.setHours(start.getHours() + Math.ceil(he.cantidad));
                return {
                    start_time: start.toISOString().replace('.000Z', '').replace('Z', ''),
                    end_time: end.toISOString().replace('.000Z', '').replace('Z', ''),
                    quantity: Number(he.cantidad),
                    percentage: 3, // ID 3 = Hora Extra Dominical/Festiva Diurna
                    payment: Number(he.valorTotal).toFixed(2)
                };
            }),
            other_concepts: otrosDevengados.map(o => ({
                salary_concept: Number(o.valorTotal).toFixed(2),
                non_salary_concept: "0.00",
                description_concept: o.concepto?.nombre || "Otro Concepto"
            }))
        };

        const deductionItems = {
            eps_type_law_deductions_id: 1,
            eps_deduction: Number(salud?.valorTotal || 0).toFixed(2),
            pension_type_law_deductions_id: 5,
            pension_deduction: Number(pension?.valorTotal || 0).toFixed(2),
            other_deductions: otrasDeducciones.map(o => ({
                other_deduction: Number(o.valorTotal).toFixed(2)
            }))
        };

        // Recalculate totals from items to ensure strict consistency
        const totalDevengadoCalculado =
            Number(accruedItems.salary) +
            Number(accruedItems.transportation_allowance) +
            accruedItems.HEDs.reduce((acc, he) => acc + Number(he.payment), 0) +
            accruedItems.HEDDFs.reduce((acc, he) => acc + Number(he.payment), 0) +
            accruedItems.other_concepts.reduce((acc, o) => acc + Number(o.salary_concept) + Number(o.non_salary_concept), 0);

        const totalDeduccionesCalculado =
            Number(deductionItems.eps_deduction) +
            Number(deductionItems.pension_deduction) +
            deductionItems.other_deductions.reduce((acc, o) => acc + Number(o.other_deduction), 0);

        const netValueCalculado = totalDevengadoCalculado - totalDeduccionesCalculado;

        // Map to DIAN Format
        const json = {
            type_document_id: 9, // Dynamic from base data or fallback
            establishment_name: empresa.nombre,
            establishment_address: empresa.direccion,
            establishment_phone: empresa.telefono,
            establishment_municipality: parseInt(municipioEmpresa?.establishment_municipality || empresa.municipioId || '0'),
            establishment_email: empresa.emailContacto || empresa.userEmail,
            head_note: "Nómina Electrónica - Generada automáticamente",
            foot_note: nomina.observaciones || "",
            novelty: {
                novelty: false,
                uuidnov: ""
            },
            period: {
                admision_date: new Date(nomina.empleado.fecha_ingreso).toISOString().split('T')[0],
                settlement_start_date: new Date(nomina.periodo.fecha_inicio).toISOString().split('T')[0],
                settlement_end_date: new Date(nomina.periodo.fecha_fin).toISOString().split('T')[0],
                worked_time: (nomina.diasPagados * 240 / 30),
                issue_date: new Date().toISOString().split('T')[0]
            },
            worker_code: nomina.empleado.cedula,
            prefix: "NI",
            consecutive: nomina.id,
            payroll_period_id: payroll_period_id,
            notes: nomina.observaciones || "Envío de nómina electrónica",
            worker: {
                type_worker_id: parseInt(empleadoDetallado?.tipo_trabajador_id || '1'),
                sub_type_worker_id: parseInt(empleadoDetallado?.subtipo_trabajador_id || '1'),
                payroll_type_document_identification_id: worker_type_document_id,
                municipality_id: parseInt(municipioTrabajador?.establishment_municipality || empleadoDetallado?.municipio_id || '0'),
                type_contract_id: parseInt(empleadoDetallado?.tipo_contrato_id || '1'),
                high_risk_pension: nomina.empleado.alto_riesgo_pension || false,
                identification_number: parseInt(nomina.empleado.cedula),
                surname: nomina.empleado.primer_apellido,
                second_surname: nomina.empleado.segundo_apellido || "",
                first_name: nomina.empleado.primer_nombre,
                address: nomina.empleado.direccion || "Dirección no especificada",
                integral_salarary: nomina.empleado.salario_integral || false,
                salary: Number(nomina.empleado.salario_mensual).toFixed(2)
            },
            payment: {
                payment_method_id: parseInt(formaPago?.codigo_dian || '10'),
                bank_name: empleadoDetallado?.banco_nombre || "Efectivo",
                account_type: empleadoDetallado?.tipo_cuenta_nombre || "AHORROS",
                account_number: nomina.empleado.numero_cuenta || "0"
            },
            payment_dates: [
                { payment_date: new Date(nomina.periodo.fecha_fin).toISOString().split('T')[0] }
            ],
            accrued: {
                ...accruedItems,
                accrued_total: totalDevengadoCalculado.toFixed(2)
            },
            deductions: {
                ...deductionItems,
                deductions_total: totalDeduccionesCalculado.toFixed(2)
            },
            net_value: netValueCalculado.toFixed(2)
        };

        return json;
    }
}

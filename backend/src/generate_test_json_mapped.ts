import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function generateTestJsonMapped() {
    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER.replace(/'/g, ''),
            password: process.env.POSTGRES_PASSWORD.replace(/'/g, ''),
            database: process.env.POSTGRES_DB,
            synchronize: false,
        });

        const nominaId = 3;

        // Fetch data similar to updated service
        const nomina = await connection.query('SELECT * FROM nominas WHERE id = $1', [nominaId]);
        const n = nomina[0];

        const empresa = await connection.query('SELECT * FROM empresas WHERE id = $1', [n.empresa_id]);
        const emp = empresa[0];

        const empleado = await connection.query('SELECT * FROM empleados WHERE id = $1', [n.empleado_id]);
        const empld = empleado[0];

        const periodo = await connection.query('SELECT * FROM periodos_nomina WHERE id = $1', [n.periodo_id]);
        const per = periodo[0];

        const details = await connection.query(`
      SELECT nd.*, c.nombre as concepto_nombre, c.subtipo, c.tipo as concepto_tipo, c.porcentaje
      FROM nomina_detalle nd 
      JOIN conceptos_nomina c ON nd.concepto_id = c.id 
      WHERE nd.nomina_id = $1
    `, [nominaId]);

        const [empleadoDetallado] = await connection.query(
            'SELECT * FROM view_empleados_detallados WHERE id = $1',
            [n.empleado_id],
        );

        // Mappings
        const [formaPago] = await connection.query(
            'SELECT codigo_dian FROM formas_pagos WHERE codigo = $1 AND empresa_id = $2',
            [empleadoDetallado?.metodo_pago_id, n.empresa_id]
        );

        const [municipioEmpresa] = await connection.query(
            'SELECT codigo FROM ciudades WHERE nombre ILIKE $1 OR codigo::text = $2 LIMIT 1',
            [emp.direccion.split(',').pop()?.trim(), emp.municipio_id]
        );

        const payroll_period_id = n.dias_pagados > 16 ? 4 : 5;

        const baseDetalle = details.find(d => d.subtipo === 'BASICO');
        const auxTransporte = details.find(d => d.subtipo === 'AUXILIO_TRANSPORTE');
        const salud = details.find(d => d.subtipo === 'DEDUCCION_SALUD');
        const pension = details.find(d => d.subtipo === 'DEDUCCION_PENSION');
        const heDiurnas = details.filter(d => d.subtipo === 'HORA_EXTRA_DIURNA');

        const json = {
            type_document_id: emp.tipo_documento_id || 9,
            establishment_name: emp.nombre,
            establishment_address: emp.direccion,
            establishment_phone: emp.telefono,
            establishment_municipality: parseInt(municipioEmpresa?.codigo || emp.municipio_id || '0'),
            establishment_email: emp.email_contacto || emp.user_email,
            period: {
                admision_date: empld.fecha_ingreso.toISOString().split('T')[0],
                settlement_start_date: per.fecha_inicio.toISOString().split('T')[0],
                settlement_end_date: per.fecha_fin.toISOString().split('T')[0],
                worked_time: (n.dias_pagados * 240 / 30),
                issue_date: new Date().toISOString().split('T')[0]
            },
            worker_code: empld.cedula,
            prefix: "NI",
            consecutive: n.id,
            payroll_period_id: payroll_period_id,
            worker: {
                type_worker_id: parseInt(empleadoDetallado?.tipo_trabajador_id || '1'),
                sub_type_worker_id: parseInt(empleadoDetallado?.subtipo_trabajador_id || '1'),
                payroll_type_document_identification_id: parseInt(empleadoDetallado?.tipo_documento_id || '13'),
                municipality_id: parseInt(empleadoDetallado?.municipio_id || '0'),
                type_contract_id: parseInt(empleadoDetallado?.tipo_contrato_id || '1'),
                identification_number: parseInt(empld.cedula),
                surname: empld.primer_apellido,
                first_name: empld.primer_nombre,
                salary: Number(empld.salario_mensual).toFixed(2)
            },
            payment: {
                payment_method_id: parseInt(formaPago?.codigo_dian || '10'),
                bank_name: empleadoDetallado?.banco_nombre || "Efectivo"
            },
            accrued: {
                worked_days: n.dias_pagados,
                salary: Number(baseDetalle?.valor_total || 0).toFixed(2),
                transportation_allowance: Number(auxTransporte?.valor_total || 0).toFixed(2),
                HEDs: heDiurnas.map(he => ({
                    quantity: he.cantidad,
                    percentage: he.porcentaje || 1.25,
                    payment: Number(he.valor_total).toFixed(2)
                })),
                accrued_total: Number(n.total_devengado).toFixed(2)
            },
            deductions: {
                eps_type_law_deductions_id: 1,
                eps_deduction: Number(salud?.valor_total || 0).toFixed(2),
                pension_type_law_deductions_id: 5,
                pension_deduction: Number(pension?.valor_total || 0).toFixed(2),
                deductions_total: Number(n.total_deducciones).toFixed(2)
            },
            net_value: Number(n.neto_pagar).toFixed(2)
        };

        fs.writeFileSync('test_nomina_dian_mapped.json', JSON.stringify(json, null, 4));
        console.log('JSON generated in test_nomina_dian_mapped.json');

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

generateTestJsonMapped();

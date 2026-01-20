import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function generateTestJsonFinal() {
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

        // New Mapping: Frequency
        const [periodType] = await connection.query(
            'SELECT code FROM payroll_periods WHERE id = $1 LIMIT 1',
            [per.id_payroll_periods]
        );
        let payroll_period_id = 4; // Default Mensual
        if (periodType?.code) {
            const code = periodType.code.toString();
            if (code === '5') payroll_period_id = 4;
            else if (code === '4') payroll_period_id = 5;
            else payroll_period_id = parseInt(code);
        }

        const json = {
            establishment_municipality: parseInt(emp.municipio_id || '0'),
            payroll_period_id: payroll_period_id,
            worker: {
                payroll_type_document_identification_id: 13, // CC
                identification_number: parseInt(empld.cedula),
                surname: empld.primer_apellido,
                first_name: empld.primer_nombre
            },
            accrued: {
                worked_days: n.dias_pagados,
                salary: Number(n.salario_basico || 0).toFixed(2)
            },
            net_value: Number(n.neto_pagar).toFixed(2)
        };

        fs.writeFileSync('test_nomina_final_debug.json', JSON.stringify(json, null, 4));
        console.log('JSON generated in test_nomina_final_debug.json');
        console.log('Detected frequency code:', periodType?.code, '-> DIAN:', payroll_period_id);

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

generateTestJsonFinal();

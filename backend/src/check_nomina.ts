import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkData() {
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

        console.log('Connected to DB');

        const details = await connection.query(`
      SELECT nd.nomina_id, c.nombre, c.subtipo, nd.valor_total 
      FROM nomina_detalle nd 
      JOIN conceptos_nomina c ON nd.concepto_id = c.id 
      WHERE nd.empresa_id = 2
      ORDER BY nd.nomina_id LIMIT 20
    `);
        console.log('Detalle de Nóminas (Empresa 2):');
        console.table(details);

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();

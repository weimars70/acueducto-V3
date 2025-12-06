
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Get diferidos with 0 quota
        const res = await client.query(`
            SELECT id, monto_original, numero_cuotas, por_interes 
            FROM diferido 
            WHERE valor_cuota = 0 OR valor_cuota IS NULL
        `);

        console.log(`Found ${res.rowCount} records with 0 quota.`);

        for (const row of res.rows) {
            const monto = parseFloat(row.monto_original);
            const cuotas = parseInt(row.numero_cuotas);
            const interes = parseFloat(row.por_interes || 0);

            if (cuotas > 0) {
                let valorCuota = 0;
                if (interes === 0) {
                    valorCuota = monto / cuotas;
                } else {
                    const totalConInteres = monto + (monto * (interes / 100));
                    valorCuota = totalConInteres / cuotas;
                }

                await client.query(`
                    UPDATE diferido 
                    SET valor_cuota = $1 
                    WHERE id = $2
                `, [valorCuota, row.id]);

                console.log(`Updated ID ${row.id}: ${valorCuota.toFixed(2)}`);
            }
        }

        console.log('Finished repairing quotas.');

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

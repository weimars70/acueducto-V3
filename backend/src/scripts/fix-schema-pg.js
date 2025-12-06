
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

        // 1. Ensure Unique Constraint on instalaciones(codigo, empresa_id)
        console.log('Checking constraint on installations...');
        try {
            await client.query(`
                ALTER TABLE instalaciones 
                ADD CONSTRAINT uq_instalaciones_codigo_empresa UNIQUE (codigo, empresa_id);
            `);
            console.log('Added unique constraint to instalaciones.');
        } catch (e) {
            if (e.code === '42710') { // duplicate_object
                console.log('Constraint on instalaciones already exists.');
            } else {
                console.error('Error adding constraint to instalaciones:', e.message); // checking if it fails due to duplicates
                // If duplicates exist, we can't create the FK. 
                // But assuming clean data or acceptable risk for dev. 
            }
        }

        // 2. Ensure Unique Constraint on conceptos_factura(codigo, empresa_id)
        console.log('Checking constraint on conceptos_factura...');
        try {
            await client.query(`
                ALTER TABLE conceptos_factura
                ADD CONSTRAINT uq_conceptos_codigo_empresa UNIQUE (codigo, empresa_id);
            `);
            console.log('Added unique constraint to conceptos_factura.');
        } catch (e) {
            if (e.code === '42710') {
                console.log('Constraint on conceptos_factura already exists.');
            } else {
                console.error('Error adding constraint to conceptos_factura:', e.message);
            }
        }

        // 3. Create Table diferido
        console.log('Creating table diferido...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS diferido (
                id SERIAL PRIMARY KEY,
                contrato_id INTEGER NOT NULL,
                concepto_diferido_id INTEGER NOT NULL,
                monto_original NUMERIC(10, 2) NOT NULL,
                numero_cuotas INTEGER NOT NULL,
                cuotas_pendientes INTEGER NOT NULL,
                fecha_inicio DATE NOT NULL,
                estado VARCHAR(20) NOT NULL,
                observaciones TEXT NULL,
                empresa_id INTEGER NOT NULL,
                usuario TEXT NOT NULL,
                CONSTRAINT fk_concepto
                    FOREIGN KEY (concepto_diferido_id, empresa_id)
                    REFERENCES conceptos_factura (codigo, empresa_id),
                CONSTRAINT fk_instalaciones 
                    FOREIGN KEY (contrato_id, empresa_id)
                    REFERENCES instalaciones (codigo, empresa_id) 
            );
        `);
        console.log('Table diferido created successfully.');

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

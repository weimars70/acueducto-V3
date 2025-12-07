
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

        // 1. Estratos Tipo
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.estratos_tipo (
                codigo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                nombre TEXT NOT NULL UNIQUE,
                empresa_id INTEGER NOT NULL,
                usuario TEXT
            );
        `);
        console.log('Table estratos_tipo created/verified.');

        // 2. Estratos
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.estratos (
                codigo SERIAL PRIMARY KEY,
                nombre TEXT NOT NULL UNIQUE,
                empresa_id INTEGER NOT NULL,
                usuario TEXT
            );
        `);
        console.log('Table estratos created/verified.');

        // 3. Estratos Tarifas
        // Note: DDL says PK is (codigo, tipo), and unique id.
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.estratos_tarifas (
                codigo INTEGER NOT NULL,
                estrato VARCHAR DEFAULT '0' NOT NULL,
                cargo NUMERIC(12,2) DEFAULT 0 NOT NULL,
                m3_0_20 NUMERIC(12,2) DEFAULT 0 NOT NULL,
                m3_21_40 NUMERIC(12,2) DEFAULT 0 NOT NULL,
                m3_41_x NUMERIC(12,2) DEFAULT 0 NOT NULL,
                interes NUMERIC(12,2) DEFAULT 1.00 NOT NULL,
                tipo INTEGER NOT NULL,
                subsidio_cargo_fijo NUMERIC(12,2) DEFAULT 0,
                subsidio_consumo NUMERIC(12,2) DEFAULT 0,
                id SERIAL UNIQUE,
                subsidio_consumo_complementario NUMERIC(12,2) DEFAULT 0 NOT NULL,
                subsidio_consumo_suntuario NUMERIC(12,2) DEFAULT 0 NOT NULL,
                empresa_id INTEGER NOT NULL,
                usuario TEXT,
                CONSTRAINT estratos_tarifas_estratos_pkey PRIMARY KEY(codigo, tipo)
            );
        `);
        console.log('Table estratos_tarifas created/verified.');

    } catch (err) {
        if (err.code === '42P07') { // Relation exists
            console.log('Tables already exist, skipping creation.');
        } else {
            console.error('Error creating tables:', err);
        }
    } finally {
        await client.end();
    }
}

run();

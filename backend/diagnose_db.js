const { Client } = require('pg');

async function diagnose() {
    const client = new Client({
        user: 'weymars',
        host: '2.58.80.90',
        database: 'acueducto_emp',
        password: '##LosHijos162025?!##',
        port: 55433,
    });

    try {
        await client.connect();
        console.log('--- DIAGNÓSTICO DE BASE DE DATOS ---');

        const countNominas = await client.query('SELECT COUNT(*) FROM public.nominas');
        console.log('Total Nóminas:', countNominas.rows[0].count);

        const countPeriodos = await client.query('SELECT id, nombre, estado FROM public.periodos_nomina LIMIT 10');
        console.log('Periodos de Nómina:');
        console.table(countPeriodos.rows);

        const countConceptos = await client.query('SELECT id, codigo, nombre, subtipo FROM public.conceptos_nomina WHERE subtipo IS NOT NULL');
        console.log('Conceptos con Subtipo:');
        console.table(countConceptos.rows);

        await client.end();
    } catch (err) {
        console.error('Error en diagnóstico:', err.message);
    }
}

diagnose();

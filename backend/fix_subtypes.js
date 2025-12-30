const { Client } = require('pg');

async function fixSubtypes() {
    const client = new Client({
        user: 'weymars',
        host: '2.58.80.90',
        database: 'acueducto_emp',
        password: '##LosHijos162025?!##',
        port: 55433,
    });

    try {
        await client.connect();
        console.log('Conectado a la base de datos.');

        // Actualizar subtipos para Salud y Pensión para que coincidan con el nuevo código
        await client.query("UPDATE public.conceptos_nomina SET subtipo = 'DEDUCCION_SALUD' WHERE subtipo = 'SALUD' OR codigo = 'SALUD'");
        await client.query("UPDATE public.conceptos_nomina SET subtipo = 'DEDUCCION_PENSION' WHERE subtipo = 'PENSION' OR codigo = 'PENSION'");

        console.log('Subtipos actualizados correctamente.');

        // Verificar cambios
        const res = await client.query("SELECT id, codigo, nombre, subtipo FROM public.conceptos_nomina WHERE subtipo LIKE 'DEDUCCION_%'");
        console.table(res.rows);

        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixSubtypes();

-- =====================================================
-- ACTUALIZACIÓN TABLA CONSUMO Y FUNCIÓN get_previous_reading
-- Agregar empresa_id y actualizar función
-- =====================================================

-- 1. Agregar columna empresa_id si no existe
ALTER TABLE consumo
ADD COLUMN IF NOT EXISTS empresa_id INTEGER;

-- 2. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_consumo_empresa_id ON consumo(empresa_id);

-- 3. Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS get_previous_reading(integer, integer);

-- 4. Crear nueva función con empresa_id
CREATE OR REPLACE FUNCTION get_previous_reading(
    p_instalacion integer,
    p_codigo integer,
    p_empresa_id integer
)
RETURNS TABLE (
    lectura_anterior numeric,
    promedio numeric
) AS $$
DECLARE
    v_year integer;
    v_mes integer;
BEGIN
    -- Obtener año y mes del consumo actual
    SELECT year, mes INTO v_year, v_mes
    FROM consumo
    WHERE codigo = p_codigo AND empresa_id = p_empresa_id;

    -- Si no se encuentra el consumo, retornar valores por defecto
    IF v_year IS NULL THEN
        RETURN QUERY SELECT 0::numeric, 0::numeric;
        RETURN;
    END IF;

    -- Obtener lectura anterior y promedio
    RETURN QUERY
    SELECT
        COALESCE(
            (SELECT lectura
             FROM consumo c
             WHERE c.instalacion = p_instalacion
               AND c.empresa_id = p_empresa_id
               AND (c.year < v_year OR (c.year = v_year AND c.mes < v_mes))
             ORDER BY c.year DESC, c.mes DESC
             LIMIT 1),
            0
        ) as lectura_anterior,
        COALESCE(
            (SELECT AVG(consumo)
             FROM (
                 SELECT consumo
                 FROM consumo c
                 WHERE c.instalacion = p_instalacion
                   AND c.empresa_id = p_empresa_id
                   AND (c.year < v_year OR (c.year = v_year AND c.mes < v_mes))
                 ORDER BY c.year DESC, c.mes DESC
                 LIMIT 6
             ) sub),
            0
        ) as promedio;
END;
$$ LANGUAGE plpgsql;

-- 5. Actualizar vista view_consumo para incluir empresa_id si es necesario
-- (Ejecutar si la vista ya existe)
/*
DROP VIEW IF EXISTS view_consumo;
CREATE VIEW view_consumo AS
SELECT
    c.codigo,
    c.instalacion,
    i.nombre,
    c.lectura,
    c.fecha,
    c.mes,
    c.year,
    c.mes || '-' || c.year as mes_codigo,
    c.consumo,
    c.medidor,
    c.otros_cobros,
    c.reconexion,
    c.facturado,
    c.empresa_id
FROM consumo c
LEFT JOIN instalaciones i ON c.instalacion = i.codigo;
*/

-- 6. Verificar resultados
SELECT 'Script ejecutado exitosamente' as status;
SELECT COUNT(*) as consumos_sin_empresa FROM consumo WHERE empresa_id IS NULL;

-- Si hay consumos sin empresa_id, actualizarlos con un valor por defecto (opcional)
-- UPDATE consumo SET empresa_id = 1 WHERE empresa_id IS NULL;

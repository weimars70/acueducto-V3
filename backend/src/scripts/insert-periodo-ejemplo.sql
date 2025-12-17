-- =====================================================
-- INSERTAR PERÍODO DE NÓMINA DE EJEMPLO
-- Script para crear un período de prueba
-- =====================================================

-- Insertar período de ejemplo para Enero 2025 (Primera Quincena)
INSERT INTO periodos_nomina (
    codigo,
    nombre,
    anio,
    mes,
    numero_periodo,
    fecha_inicio,
    fecha_fin,
    dias_periodo,
    estado,
    empresa_id,
    usuario_creacion
)
VALUES
    (
        'PER-2025-01-1',
        'Primera Quincena Enero 2025',
        2025,
        1,
        1,
        '2025-01-01',
        '2025-01-15',
        15,
        'ABIERTO',
        1,
        1
    ),
    (
        'PER-2025-01-2',
        'Segunda Quincena Enero 2025',
        2025,
        1,
        2,
        '2025-01-16',
        '2025-01-31',
        16,
        'ABIERTO',
        1,
        1
    ),
    (
        'PER-2025-02-1',
        'Primera Quincena Febrero 2025',
        2025,
        2,
        1,
        '2025-02-01',
        '2025-02-15',
        15,
        'ABIERTO',
        1,
        1
    )
ON CONFLICT (empresa_id, anio, mes, numero_periodo) DO NOTHING;

-- Verificar períodos insertados
SELECT
    id,
    codigo,
    nombre,
    fecha_inicio,
    fecha_fin,
    dias_periodo,
    estado
FROM periodos_nomina
ORDER BY fecha_inicio DESC;

-- Mensaje de confirmación
DO $$
DECLARE
    periodo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO periodo_count FROM periodos_nomina;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Períodos de nómina creados exitosamente';
    RAISE NOTICE 'Total de períodos en la base de datos: %', periodo_count;
    RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- INSERTAR EMPLEADOS DE EJEMPLO
-- Script para crear empleados de prueba para nómina
-- =====================================================

-- Insertar empleados de ejemplo
INSERT INTO empleados (
    cedula,
    nombre_completo,
    nombre_corto,
    salario_mensual,
    auxilio_transporte,
    activo,
    fecha_ingreso,
    cargo,
    empresa_id,
    usuario_creacion
)
VALUES
    (
        '1000000001',
        'Juan Carlos Rodríguez Pérez',
        'Juan Rodríguez',
        2500000.00,
        true,
        true,
        '2024-01-15',
        'Administrador',
        1,
        1
    ),
    (
        '1000000002',
        'María Elena López García',
        'María López',
        1950000.00,
        true,
        true,
        '2024-02-01',
        'Operario',
        1,
        1
    ),
    (
        '1000000003',
        'Carlos Andrés Martínez Silva',
        'Carlos Martínez',
        2250000.00,
        true,
        true,
        '2024-03-10',
        'Contador',
        1,
        1
    ),
    (
        '1000000004',
        'Ana Patricia Gómez Torres',
        'Ana Gómez',
        1650000.00,
        true,
        true,
        '2024-04-05',
        'Auxiliar Contable',
        1,
        1
    ),
    (
        '1000000005',
        'Pedro Luis Sánchez Ramírez',
        'Pedro Sánchez',
        1950000.00,
        true,
        true,
        '2024-05-20',
        'Fontanero',
        1,
        1
    ),
    (
        '1000000006',
        'Laura Cristina Hernández Castro',
        'Laura Hernández',
        1800000.00,
        true,
        true,
        '2024-06-01',
        'Secretaria',
        1,
        1
    )
ON CONFLICT (cedula) DO NOTHING;

-- Verificar empleados insertados
SELECT
    id,
    cedula,
    nombre_completo,
    salario_mensual,
    auxilio_transporte,
    activo,
    fecha_ingreso,
    cargo
FROM empleados
WHERE activo = true
ORDER BY nombre_completo;

-- Mensaje de confirmación
DO $$
DECLARE
    empleado_count INTEGER;
    activos_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO empleado_count FROM empleados;
    SELECT COUNT(*) INTO activos_count FROM empleados WHERE activo = true;

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Empleados creados exitosamente';
    RAISE NOTICE 'Total de empleados: %', empleado_count;
    RAISE NOTICE 'Empleados activos: %', activos_count;
    RAISE NOTICE '==============================================';
END $$;

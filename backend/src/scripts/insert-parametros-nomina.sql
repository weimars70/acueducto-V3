-- =====================================================
-- INSERTAR PARÁMETROS DE NÓMINA
-- Script simplificado para insertar solo los parámetros
-- =====================================================

-- Parámetros básicos para el año 2025
INSERT INTO parametros_nomina (codigo, nombre, descripcion, valor, anio, empresa_id, usuario_creacion)
VALUES
    ('SMMLV_2025', 'Salario Mínimo Legal Vigente 2025', 'SMMLV Colombia 2025', 1423500, 2025, 1, 1),
    ('AUX_TRANSPORTE_2025', 'Auxilio de Transporte 2025', 'Auxilio de transporte Colombia 2025', 200000, 2025, 1, 1),
    ('HORAS_MES', 'Horas Laborales Mensuales', 'Cantidad de horas laborales al mes', 220, 2025, 1, 1),
    ('DIAS_MES', 'Días Laborales Mensuales', 'Cantidad de días laborales al mes', 30, 2025, 1, 1),
    ('PORC_SALUD_EMP', 'Porcentaje Salud Empleado', 'Aporte a salud del empleado', 4.00, 2025, 1, 1),
    ('PORC_PENSION_EMP', 'Porcentaje Pensión Empleado', 'Aporte a pensión del empleado', 4.00, 2025, 1, 1),
    ('PORC_HED', 'Recargo Hora Extra Diurna', 'Porcentaje de recargo para hora extra diurna', 25.00, 2025, 1, 1),
    ('PORC_HEN', 'Recargo Hora Extra Nocturna', 'Porcentaje de recargo para hora extra nocturna', 75.00, 2025, 1, 1),
    ('PORC_HEFD', 'Recargo Hora Extra Festiva Diurna', 'Porcentaje de recargo para hora extra festiva diurna', 75.00, 2025, 1, 1),
    ('PORC_HEFN', 'Recargo Hora Extra Festiva Nocturna', 'Porcentaje de recargo para hora extra festiva nocturna', 110.00, 2025, 1, 1)
ON CONFLICT (codigo) DO NOTHING;

-- Verificar inserción
SELECT codigo, nombre, valor, anio FROM parametros_nomina ORDER BY codigo;

-- =====================================================
-- SETUP COMPLETO PARÁMETROS DE NÓMINA
-- Script para crear tabla e insertar datos iniciales
-- =====================================================

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS parametros_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    anio INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT uk_parametros_nomina_codigo_anio UNIQUE (codigo, anio, empresa_id)
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_parametros_nomina_empresa ON parametros_nomina(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parametros_nomina_anio ON parametros_nomina(anio);
CREATE INDEX IF NOT EXISTS idx_parametros_nomina_codigo ON parametros_nomina(codigo);

-- 3. Insertar parámetros básicos para el año 2025
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
ON CONFLICT (codigo, anio, empresa_id) DO NOTHING;

-- 4. Verificar resultados
SELECT 'Tabla creada exitosamente' as status;
SELECT COUNT(*) as total_parametros FROM parametros_nomina;
SELECT DISTINCT anio as años_disponibles FROM parametros_nomina ORDER BY anio DESC;
SELECT codigo, nombre, valor, anio FROM parametros_nomina ORDER BY codigo;

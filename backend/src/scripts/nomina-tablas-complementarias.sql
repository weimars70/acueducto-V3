-- =====================================================
-- TABLAS COMPLEMENTARIAS PARA NÓMINA
-- Script para crear tablas adicionales necesarias
-- Ejecutar después de nomina-completo.sql
-- =====================================================

-- =====================================================
-- 1. Actualizar tabla conceptos_nomina
-- Agregar campo subtipo para mejor categorización
-- =====================================================
ALTER TABLE conceptos_nomina
ADD COLUMN IF NOT EXISTS subtipo VARCHAR(30);

COMMENT ON COLUMN conceptos_nomina.subtipo IS 'Subtipo del concepto: BASICO, HORA_EXTRA_DIURNA, HORA_EXTRA_FESTIVA, AUXILIO_TRANSPORTE, OTRO, etc.';

-- Actualizar conceptos existentes con subtipo
UPDATE conceptos_nomina SET subtipo = 'BASICO' WHERE codigo = 'SAL_BASICO';
UPDATE conceptos_nomina SET subtipo = 'HORA_EXTRA_DIURNA' WHERE codigo = 'HED';
UPDATE conceptos_nomina SET subtipo = 'HORA_EXTRA_NOCTURNA' WHERE codigo = 'HEN';
UPDATE conceptos_nomina SET subtipo = 'HORA_EXTRA_FESTIVA' WHERE codigo IN ('HEFD', 'HEFN');
UPDATE conceptos_nomina SET subtipo = 'AUXILIO_TRANSPORTE' WHERE codigo = 'AUX_TRANS';
UPDATE conceptos_nomina SET subtipo = 'OTRO' WHERE codigo = 'BONIFICACION';
UPDATE conceptos_nomina SET subtipo = 'DEDUCCION_SALUD' WHERE codigo = 'DED_SALUD';
UPDATE conceptos_nomina SET subtipo = 'DEDUCCION_PENSION' WHERE codigo = 'DED_PENSION';
UPDATE conceptos_nomina SET subtipo = 'OTRO' WHERE codigo IN ('PRESTAMO', 'EMBARGO');

-- =====================================================
-- 2. Tabla: otros_pagos
-- Pagos y deducciones adicionales no recurrentes
-- =====================================================
CREATE TABLE IF NOT EXISTS otros_pagos (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'INGRESO' CHECK (tipo IN ('INGRESO', 'DEDUCCION')),
    aprobado BOOLEAN DEFAULT FALSE,
    fecha DATE DEFAULT CURRENT_DATE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id)
);

CREATE INDEX idx_otros_pagos_empleado ON otros_pagos(empleado_id);
CREATE INDEX idx_otros_pagos_periodo ON otros_pagos(periodo_id);
CREATE INDEX idx_otros_pagos_tipo ON otros_pagos(tipo);

COMMENT ON TABLE otros_pagos IS 'Pagos y deducciones adicionales no recurrentes';
COMMENT ON COLUMN otros_pagos.tipo IS 'INGRESO: Suma al devengado, DEDUCCION: Resta del neto';

-- =====================================================
-- 3. Actualizar tabla horas_extras
-- Agregar campos faltantes si no existen
-- =====================================================
DO $$
BEGIN
    -- Agregar columna valor_hora si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='horas_extras' AND column_name='valor_hora') THEN
        ALTER TABLE horas_extras ADD COLUMN valor_hora DECIMAL(12, 2);
    END IF;

    -- Renombrar valor_hora_base a valor_hora_base si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='horas_extras' AND column_name='valor_hora_base') THEN
        ALTER TABLE horas_extras RENAME COLUMN valor_hora_base TO valor_hora;
    END IF;
END $$;

-- =====================================================
-- 4. Insertar parámetros en parametros_nomina
-- =====================================================
-- La tabla ya existe, solo insertar parámetros si no existen

-- Insertar parámetros básicos si no existen
INSERT INTO parametros_nomina (codigo, nombre, descripcion, valor, anio, empresa_id, usuario_creacion)
VALUES
    ('SMMLV_2025', 'Salario Mínimo Legal Vigente 2025', 'SMMLV Colombia 2025', 1423500, 2025, 1, 1),
    ('AUX_TRANSPORTE_2025', 'Auxilio de Transporte 2025', 'Auxilio de transporte Colombia 2025', 200000, 2025, 1, 1),
    ('HORAS_MES', 'Horas Laborales Mensuales', 'Cantidad de horas laborales al mes', 220, 2025, 1, 1),
    ('DIAS_MES', 'Días Laborales Mensuales', 'Cantidad de días laborales al mes', 30, 2025, 1, 1)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 5. Vista: Resumen de nómina con empleado
-- =====================================================
CREATE OR REPLACE VIEW vista_nominas_detalle AS
SELECT
    n.id,
    n.periodo_id,
    n.empleado_id,
    e.cedula,
    e.nombre_completo as empleado_nombre,
    e.salario_mensual as salario_empleado,
    p.codigo as periodo_codigo,
    p.nombre as periodo_nombre,
    p.fecha_inicio,
    p.fecha_fin,
    p.dias_periodo,
    n.salario_mensual,
    n.valor_hora,
    n.dias_pagados,
    n.total_devengado,
    n.total_deducciones,
    n.neto_pagar,
    n.estado,
    n.observaciones,
    n.fecha_creacion,
    n.fecha_aprobacion,
    n.empresa_id
FROM nominas n
INNER JOIN empleados e ON n.empleado_id = e.id
INNER JOIN periodos_nomina p ON n.periodo_id = p.id;

COMMENT ON VIEW vista_nominas_detalle IS 'Vista completa de nóminas con información de empleado y período';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tablas complementarias creadas exitosamente';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '1. conceptos_nomina actualizado con subtipo';
    RAISE NOTICE '2. otros_pagos creada';
    RAISE NOTICE '3. horas_extras actualizada';
    RAISE NOTICE '4. parametros_nomina verificada';
    RAISE NOTICE '5. vista_nominas_detalle creada';
    RAISE NOTICE '==============================================';
END $$;

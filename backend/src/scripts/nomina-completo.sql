-- =====================================================
-- SISTEMA DE NÓMINA - COLOMBIA
-- Script completo para creación de tablas
-- Ejecutar manualmente en PostgreSQL
-- =====================================================

-- =====================================================
-- 1. TABLA: cargos
-- Define los cargos/puestos de trabajo disponibles
-- =====================================================
CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    salario_base DECIMAL(12, 2),
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100)
);

COMMENT ON TABLE cargos IS 'Catálogo de cargos/puestos de trabajo';

-- =====================================================
-- 2. TABLA: empleados
-- Información básica de los empleados
-- =====================================================
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    nombres VARCHAR(255),
    fecha_nacimiento DATE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    cargo_id INTEGER,
    salario_mensual DECIMAL(12, 2) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_retiro DATE,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'RETIRADO')),
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    FOREIGN KEY (cargo_id) REFERENCES cargos(id)
);

CREATE INDEX idx_empleados_cedula ON empleados(cedula);
CREATE INDEX idx_empleados_estado ON empleados(estado);
CREATE INDEX idx_empleados_cargo ON empleados(cargo_id);

COMMENT ON TABLE empleados IS 'Registro de empleados de la empresa';
COMMENT ON COLUMN empleados.codigo IS 'Código interno del empleado';

-- =====================================================
-- 3. TABLA: periodos_nomina
-- Define los períodos de liquidación de nómina
-- =====================================================
CREATE TABLE IF NOT EXISTS periodos_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    numero_periodo INTEGER NOT NULL CHECK (numero_periodo BETWEEN 1 AND 3),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_periodo INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'EN_PROCESO', 'CERRADO', 'PAGADO')),
    fecha_cierre TIMESTAMP,
    fecha_pago DATE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    usuario_cierre VARCHAR(100),
    UNIQUE (empresa_id, anio, mes, numero_periodo)
);

CREATE INDEX idx_periodos_estado ON periodos_nomina(estado);
CREATE INDEX idx_periodos_fechas ON periodos_nomina(anio, mes);

COMMENT ON TABLE periodos_nomina IS 'Períodos de nómina (quincenas o decenas)';
COMMENT ON COLUMN periodos_nomina.numero_periodo IS '1=Primera quincena/decena, 2=Segunda, 3=Tercera';

-- =====================================================
-- 4. TABLA: conceptos_nomina
-- Catálogo de conceptos de nómina
-- =====================================================
CREATE TABLE IF NOT EXISTS conceptos_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DEVENGADO', 'DEDUCCION')),
    naturaleza VARCHAR(30) CHECK (naturaleza IN ('FIJO', 'VARIABLE', 'OCASIONAL')),
    formula TEXT,
    porcentaje DECIMAL(5, 2),
    aplica_seguridad_social BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    orden_impresion INTEGER,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conceptos_tipo ON conceptos_nomina(tipo);
CREATE INDEX idx_conceptos_activo ON conceptos_nomina(activo);

COMMENT ON TABLE conceptos_nomina IS 'Catálogo de conceptos para devengos y deducciones';
COMMENT ON COLUMN conceptos_nomina.naturaleza IS 'FIJO: Siempre se liquida, VARIABLE: Depende de condiciones, OCASIONAL: Se aplica manualmente';

-- =====================================================
-- 5. TABLA: liquidacion_nomina
-- Encabezado de liquidación de nómina por empleado
-- =====================================================
CREATE TABLE IF NOT EXISTS liquidacion_nomina (
    id SERIAL PRIMARY KEY,
    numero_liquidacion VARCHAR(20) UNIQUE NOT NULL,
    periodo_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    fecha_liquidacion DATE NOT NULL,

    -- Información base
    salario_mensual DECIMAL(12, 2) NOT NULL,
    valor_hora DECIMAL(12, 4) NOT NULL,
    dias_trabajados INTEGER NOT NULL,
    dias_ausencias INTEGER DEFAULT 0,
    dias_incapacidad INTEGER DEFAULT 0,

    -- Totales devengados
    total_devengado DECIMAL(12, 2) DEFAULT 0,
    total_horas_extras DECIMAL(12, 2) DEFAULT 0,
    total_otros_ingresos DECIMAL(12, 2) DEFAULT 0,
    auxilio_transporte DECIMAL(12, 2) DEFAULT 0,

    -- Totales deducciones
    total_deducciones DECIMAL(12, 2) DEFAULT 0,
    deduccion_salud DECIMAL(12, 2) DEFAULT 0,
    deduccion_pension DECIMAL(12, 2) DEFAULT 0,
    otras_deducciones DECIMAL(12, 2) DEFAULT 0,

    -- Neto
    neto_pagar DECIMAL(12, 2) DEFAULT 0,

    -- Estado y control
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'CALCULADO', 'APROBADO', 'PAGADO', 'ANULADO')),
    observaciones TEXT,

    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_aprobacion TIMESTAMP,
    usuario_aprobacion VARCHAR(100),
    fecha_pago TIMESTAMP,

    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    UNIQUE (periodo_id, empleado_id)
);

CREATE INDEX idx_liquidacion_periodo ON liquidacion_nomina(periodo_id);
CREATE INDEX idx_liquidacion_empleado ON liquidacion_nomina(empleado_id);
CREATE INDEX idx_liquidacion_estado ON liquidacion_nomina(estado);
CREATE INDEX idx_liquidacion_numero ON liquidacion_nomina(numero_liquidacion);

COMMENT ON TABLE liquidacion_nomina IS 'Liquidación de nómina por empleado y período';

-- =====================================================
-- 6. TABLA: liquidacion_detalle
-- Detalle de conceptos aplicados en cada liquidación
-- =====================================================
CREATE TABLE IF NOT EXISTS liquidacion_detalle (
    id SERIAL PRIMARY KEY,
    liquidacion_id INTEGER NOT NULL,
    concepto_id INTEGER NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1,
    valor_unitario DECIMAL(12, 2) NOT NULL,
    valor_total DECIMAL(12, 2) NOT NULL,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liquidacion_id) REFERENCES liquidacion_nomina(id) ON DELETE CASCADE,
    FOREIGN KEY (concepto_id) REFERENCES conceptos_nomina(id)
);

CREATE INDEX idx_detalle_liquidacion ON liquidacion_detalle(liquidacion_id);
CREATE INDEX idx_detalle_concepto ON liquidacion_detalle(concepto_id);

COMMENT ON TABLE liquidacion_detalle IS 'Detalle de conceptos por liquidación';

-- =====================================================
-- 7. TABLA: horas_extras
-- Registro de horas extras trabajadas
-- =====================================================
CREATE TABLE IF NOT EXISTS horas_extras (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DIURNA', 'NOCTURNA', 'FESTIVA_DIURNA', 'FESTIVA_NOCTURNA')),
    cantidad_horas DECIMAL(5, 2) NOT NULL,
    valor_hora_base DECIMAL(12, 2) NOT NULL,
    porcentaje_recargo DECIMAL(5, 2) NOT NULL,
    valor_hora_extra DECIMAL(12, 2) NOT NULL,
    valor_total DECIMAL(12, 2) NOT NULL,
    aprobado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id)
);

CREATE INDEX idx_horas_empleado ON horas_extras(empleado_id);
CREATE INDEX idx_horas_periodo ON horas_extras(periodo_id);
CREATE INDEX idx_horas_fecha ON horas_extras(fecha);

COMMENT ON TABLE horas_extras IS 'Registro de horas extras por empleado';
COMMENT ON COLUMN horas_extras.tipo IS 'DIURNA: 25%, NOCTURNA: 75%, FESTIVA_DIURNA: 75%, FESTIVA_NOCTURNA: 110%';

-- =====================================================
-- 8. TABLA: novedades_nomina
-- Novedades que afectan la nómina (ausencias, incapacidades, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS novedades_nomina (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    tipo_novedad VARCHAR(30) NOT NULL CHECK (tipo_novedad IN ('AUSENCIA', 'INCAPACIDAD', 'LICENCIA', 'VACACIONES', 'SUSPENSION', 'BONIFICACION', 'DESCUENTO', 'OTRO')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    dias INTEGER,
    valor DECIMAL(12, 2),
    descripcion TEXT NOT NULL,
    documento_soporte VARCHAR(255),
    aprobado BOOLEAN DEFAULT FALSE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id)
);

CREATE INDEX idx_novedades_empleado ON novedades_nomina(empleado_id);
CREATE INDEX idx_novedades_periodo ON novedades_nomina(periodo_id);
CREATE INDEX idx_novedades_tipo ON novedades_nomina(tipo_novedad);

COMMENT ON TABLE novedades_nomina IS 'Novedades que afectan la liquidación de nómina';

-- =====================================================
-- 9. TABLA: parametros_nomina
-- Parámetros y constantes del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS parametros_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor_numerico DECIMAL(12, 2),
    valor_texto VARCHAR(255),
    tipo_dato VARCHAR(20) CHECK (tipo_dato IN ('NUMERICO', 'TEXTO', 'PORCENTAJE')),
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE,
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (codigo, vigencia_desde, empresa_id)
);

CREATE INDEX idx_parametros_codigo ON parametros_nomina(codigo);
CREATE INDEX idx_parametros_vigencia ON parametros_nomina(vigencia_desde, vigencia_hasta);

COMMENT ON TABLE parametros_nomina IS 'Parámetros configurables del sistema de nómina';

-- =====================================================
-- 10. TABLA: prestaciones_sociales
-- Acumulado de prestaciones sociales por empleado
-- =====================================================
CREATE TABLE IF NOT EXISTS prestaciones_sociales (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL,

    -- Cesantías
    cesantias_mes DECIMAL(12, 2) DEFAULT 0,
    cesantias_acumulado DECIMAL(12, 2) DEFAULT 0,

    -- Intereses sobre cesantías
    intereses_cesantias_mes DECIMAL(12, 2) DEFAULT 0,
    intereses_cesantias_acumulado DECIMAL(12, 2) DEFAULT 0,

    -- Prima de servicios
    prima_servicios_mes DECIMAL(12, 2) DEFAULT 0,
    prima_servicios_acumulado DECIMAL(12, 2) DEFAULT 0,

    -- Vacaciones
    vacaciones_mes DECIMAL(12, 2) DEFAULT 0,
    vacaciones_acumulado DECIMAL(12, 2) DEFAULT 0,

    empresa_id INTEGER NOT NULL,
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    UNIQUE (empleado_id, anio, mes)
);

CREATE INDEX idx_prestaciones_empleado ON prestaciones_sociales(empleado_id);
CREATE INDEX idx_prestaciones_periodo ON prestaciones_sociales(anio, mes);

COMMENT ON TABLE prestaciones_sociales IS 'Acumulado mensual de prestaciones sociales';

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar conceptos básicos de nómina
INSERT INTO conceptos_nomina (codigo, nombre, tipo, naturaleza, porcentaje, aplica_seguridad_social, orden_impresion, empresa_id) VALUES
('SAL_BASICO', 'Salario Básico', 'DEVENGADO', 'FIJO', NULL, TRUE, 1, 1),
('HED', 'Horas Extras Diurnas', 'DEVENGADO', 'VARIABLE', 25, TRUE, 2, 1),
('HEN', 'Horas Extras Nocturnas', 'DEVENGADO', 'VARIABLE', 75, TRUE, 3, 1),
('HEFD', 'Horas Extras Festivas Diurnas', 'DEVENGADO', 'VARIABLE', 75, TRUE, 4, 1),
('HEFN', 'Horas Extras Festivas Nocturnas', 'DEVENGADO', 'VARIABLE', 110, TRUE, 5, 1),
('AUX_TRANS', 'Auxilio de Transporte', 'DEVENGADO', 'VARIABLE', NULL, FALSE, 6, 1),
('BONIFICACION', 'Bonificación', 'DEVENGADO', 'OCASIONAL', NULL, TRUE, 7, 1),
('DED_SALUD', 'Aporte Salud (4%)', 'DEDUCCION', 'FIJO', 4.00, TRUE, 101, 1),
('DED_PENSION', 'Aporte Pensión (4%)', 'DEDUCCION', 'FIJO', 4.00, TRUE, 102, 1),
('PRESTAMO', 'Descuento Préstamo', 'DEDUCCION', 'VARIABLE', NULL, FALSE, 103, 1),
('EMBARGO', 'Embargo Judicial', 'DEDUCCION', 'OCASIONAL', NULL, FALSE, 104, 1)
ON CONFLICT (codigo) DO NOTHING;

-- Insertar parámetros iniciales
INSERT INTO parametros_nomina (codigo, nombre, tipo_dato, valor_numerico, vigencia_desde, vigencia_hasta, empresa_id) VALUES
('SMMLV', 'Salario Mínimo Legal Vigente', 'NUMERICO', 1423500, '2025-01-01', '2025-12-31', 1),
('AUX_TRANSPORTE', 'Auxilio de Transporte', 'NUMERICO', 200000, '2025-01-01', '2025-12-31', 1),
('HORAS_MES', 'Horas laborales al mes', 'NUMERICO', 220, '2025-01-01', NULL, 1),
('DIAS_MES', 'Días laborales al mes', 'NUMERICO', 30, '2025-01-01', NULL, 1),
('PORC_SALUD_EMP', 'Porcentaje Salud Empleado', 'PORCENTAJE', 4.00, '2025-01-01', NULL, 1),
('PORC_PENSION_EMP', 'Porcentaje Pensión Empleado', 'PORCENTAJE', 4.00, '2025-01-01', NULL, 1),
('PORC_HED', 'Recargo Hora Extra Diurna', 'PORCENTAJE', 25.00, '2025-01-01', NULL, 1),
('PORC_HEN', 'Recargo Hora Extra Nocturna', 'PORCENTAJE', 75.00, '2025-01-01', NULL, 1),
('PORC_HEFD', 'Recargo Hora Extra Festiva Diurna', 'PORCENTAJE', 75.00, '2025-01-01', NULL, 1),
('PORC_HEFN', 'Recargo Hora Extra Festiva Nocturna', 'PORCENTAJE', 110.00, '2025-01-01', NULL, 1)
ON CONFLICT (codigo, vigencia_desde, empresa_id) DO NOTHING;

-- Insertar cargos de ejemplo
INSERT INTO cargos (codigo, nombre, descripcion, salario_base, empresa_id) VALUES
('ADM', 'Administrador', 'Administrador del acueducto', 2500000, 1),
('OPER', 'Operario', 'Operario de mantenimiento', 1950000, 1),
('CONT', 'Contador', 'Contador', 2250000, 1),
('AUX_CONT', 'Auxiliar Contable', 'Auxiliar de contabilidad', 1423500, 1),
('FONTANERO', 'Fontanero', 'Fontanero', 1950000, 1)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Resumen de liquidación por período
CREATE OR REPLACE VIEW vista_resumen_periodo AS
SELECT
    p.id AS periodo_id,
    p.codigo AS codigo_periodo,
    p.nombre AS periodo,
    p.fecha_inicio,
    p.fecha_fin,
    p.dias_periodo,
    p.estado,
    COUNT(l.id) AS total_empleados,
    SUM(l.total_devengado) AS total_devengado,
    SUM(l.total_deducciones) AS total_deducciones,
    SUM(l.neto_pagar) AS total_neto,
    p.empresa_id
FROM periodos_nomina p
LEFT JOIN liquidacion_nomina l ON p.id = l.periodo_id
GROUP BY p.id, p.codigo, p.nombre, p.fecha_inicio, p.fecha_fin, p.dias_periodo, p.estado, p.empresa_id;

-- Vista: Liquidación completa por empleado
CREATE OR REPLACE VIEW vista_liquidacion_empleado AS
SELECT
    l.id,
    l.numero_liquidacion,
    p.nombre AS periodo,
    p.fecha_inicio,
    p.fecha_fin,
    e.cedula,
    e.nombre_completo,
    c.nombre AS cargo,
    l.salario_mensual,
    l.dias_trabajados,
    l.total_devengado,
    l.total_deducciones,
    l.neto_pagar,
    l.estado,
    l.fecha_liquidacion,
    l.empresa_id
FROM liquidacion_nomina l
INNER JOIN periodos_nomina p ON l.periodo_id = p.id
INNER JOIN empleados e ON l.empleado_id = e.id
LEFT JOIN cargos c ON e.cargo_id = c.id;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tablas de nómina creadas exitosamente';
    RAISE NOTICE 'Total de tablas: 10';
    RAISE NOTICE '1. cargos';
    RAISE NOTICE '2. empleados';
    RAISE NOTICE '3. periodos_nomina';
    RAISE NOTICE '4. conceptos_nomina';
    RAISE NOTICE '5. liquidacion_nomina';
    RAISE NOTICE '6. liquidacion_detalle';
    RAISE NOTICE '7. horas_extras';
    RAISE NOTICE '8. novedades_nomina';
    RAISE NOTICE '9. parametros_nomina';
    RAISE NOTICE '10. prestaciones_sociales';
END $$;

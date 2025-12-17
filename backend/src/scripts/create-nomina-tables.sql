-- =====================================================
-- SISTEMA DE NÓMINA PARA COLOMBIA
-- Script de creación de tablas
-- =====================================================

-- 1. TABLA: empleados
-- Almacena información básica de los empleados
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    nombre_corto VARCHAR(100),
    salario_mensual DECIMAL(12, 2) NOT NULL,
    auxilio_transporte BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_ingreso DATE NOT NULL,
    fecha_retiro DATE,
    cargo VARCHAR(100),
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT fk_empleados_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_empleados_cedula ON empleados(cedula);
CREATE INDEX idx_empleados_empresa ON empleados(empresa_id);
CREATE INDEX idx_empleados_activo ON empleados(activo);

COMMENT ON TABLE empleados IS 'Información básica de los empleados de la empresa';
COMMENT ON COLUMN empleados.auxilio_transporte IS 'Indica si el empleado recibe auxilio de transporte (aplica si gana <= 2 SMMLV)';

-- 2. TABLA: periodos_nomina
-- Define los períodos de pago (quincenas o períodos personalizados)
CREATE TABLE IF NOT EXISTS periodos_nomina (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_periodo INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'PAGADO')),
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_cierre TIMESTAMP,
    fecha_pago TIMESTAMP,
    CONSTRAINT fk_periodos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_periodos_empresa ON periodos_nomina(empresa_id);
CREATE INDEX idx_periodos_estado ON periodos_nomina(estado);
CREATE INDEX idx_periodos_fechas ON periodos_nomina(fecha_inicio, fecha_fin);

COMMENT ON TABLE periodos_nomina IS 'Períodos de nómina (quincenas, decenas, etc.)';
COMMENT ON COLUMN periodos_nomina.dias_periodo IS 'Cantidad de días del período (15 para quincena, 10 para decena)';

-- 3. TABLA: conceptos_nomina
-- Catálogo de conceptos que pueden aplicarse en la nómina
CREATE TABLE IF NOT EXISTS conceptos_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DEVENGADO', 'DEDUCCION')),
    subtipo VARCHAR(30),
    formula TEXT,
    porcentaje DECIMAL(5, 2),
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conceptos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_conceptos_codigo ON conceptos_nomina(codigo);
CREATE INDEX idx_conceptos_tipo ON conceptos_nomina(tipo);
CREATE INDEX idx_conceptos_empresa ON conceptos_nomina(empresa_id);

COMMENT ON TABLE conceptos_nomina IS 'Catálogo de conceptos de devengos y deducciones';
COMMENT ON COLUMN conceptos_nomina.subtipo IS 'BASICO, HORA_EXTRA_DIURNA, HORA_EXTRA_FESTIVA, AUXILIO_TRANSPORTE, SALUD, PENSION, OTRO';

-- Insertar conceptos básicos
INSERT INTO conceptos_nomina (codigo, nombre, descripcion, tipo, subtipo, porcentaje, empresa_id) VALUES
('BASICO', 'Salario Básico', 'Salario básico del período', 'DEVENGADO', 'BASICO', NULL, 1),
('HED', 'Horas Extras Diurnas', 'Horas extras diurnas (25% recargo)', 'DEVENGADO', 'HORA_EXTRA_DIURNA', 125, 1),
('HEF', 'Horas Extras Festivas', 'Horas extras festivas (75% recargo)', 'DEVENGADO', 'HORA_EXTRA_FESTIVA', 175, 1),
('AUX_TRANS', 'Auxilio de Transporte', 'Auxilio de transporte mensual', 'DEVENGADO', 'AUXILIO_TRANSPORTE', NULL, 1),
('SALUD', 'Aporte Salud', 'Aporte a salud (4%)', 'DEDUCCION', 'SALUD', 4, 1),
('PENSION', 'Aporte Pensión', 'Aporte a pensión (4%)', 'DEDUCCION', 'PENSION', 4, 1),
('OTRO_PAGO', 'Otros Pagos', 'Otros pagos diversos', 'DEVENGADO', 'OTRO', NULL, 1),
('OTRA_DEDUC', 'Otras Deducciones', 'Otras deducciones', 'DEDUCCION', 'OTRO', NULL, 1)
ON CONFLICT (codigo) DO NOTHING;

-- 4. TABLA: nominas
-- Encabezado de nómina por período y empleado
CREATE TABLE IF NOT EXISTS nominas (
    id SERIAL PRIMARY KEY,
    periodo_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    salario_mensual DECIMAL(12, 2) NOT NULL,
    valor_hora DECIMAL(12, 4) NOT NULL,
    dias_pagados INTEGER NOT NULL,
    total_devengado DECIMAL(12, 2) DEFAULT 0,
    total_deducciones DECIMAL(12, 2) DEFAULT 0,
    neto_pagar DECIMAL(12, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'APROBADO', 'PAGADO')),
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_aprobacion TIMESTAMP,
    usuario_aprobacion INTEGER,
    CONSTRAINT fk_nominas_periodo FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    CONSTRAINT fk_nominas_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    CONSTRAINT fk_nominas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT uk_nomina_periodo_empleado UNIQUE (periodo_id, empleado_id)
);

CREATE INDEX idx_nominas_periodo ON nominas(periodo_id);
CREATE INDEX idx_nominas_empleado ON nominas(empleado_id);
CREATE INDEX idx_nominas_estado ON nominas(estado);
CREATE INDEX idx_nominas_empresa ON nominas(empresa_id);

COMMENT ON TABLE nominas IS 'Nómina de cada empleado por período';
COMMENT ON COLUMN nominas.valor_hora IS 'Calculado como salario_mensual / 220';

-- 5. TABLA: nomina_detalle
-- Detalle de conceptos aplicados en cada nómina
CREATE TABLE IF NOT EXISTS nomina_detalle (
    id SERIAL PRIMARY KEY,
    nomina_id INTEGER NOT NULL,
    concepto_id INTEGER NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1,
    valor_unitario DECIMAL(12, 2),
    valor_total DECIMAL(12, 2) NOT NULL,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT fk_detalle_nomina FOREIGN KEY (nomina_id) REFERENCES nominas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_concepto FOREIGN KEY (concepto_id) REFERENCES conceptos_nomina(id),
    CONSTRAINT fk_detalle_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_detalle_nomina ON nomina_detalle(nomina_id);
CREATE INDEX idx_detalle_concepto ON nomina_detalle(concepto_id);
CREATE INDEX idx_detalle_empresa ON nomina_detalle(empresa_id);

COMMENT ON TABLE nomina_detalle IS 'Detalle de conceptos aplicados por nómina';
COMMENT ON COLUMN nomina_detalle.cantidad IS 'Cantidad (ej: horas, días, unidades)';

-- 6. TABLA: horas_extras
-- Registro de horas extras trabajadas
CREATE TABLE IF NOT EXISTS horas_extras (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DIURNA', 'FESTIVA', 'NOCTURNA')),
    cantidad_horas DECIMAL(5, 2) NOT NULL,
    valor_hora DECIMAL(12, 2) NOT NULL,
    valor_total DECIMAL(12, 2) NOT NULL,
    aprobado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT fk_horas_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    CONSTRAINT fk_horas_periodo FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    CONSTRAINT fk_horas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_horas_empleado ON horas_extras(empleado_id);
CREATE INDEX idx_horas_periodo ON horas_extras(periodo_id);
CREATE INDEX idx_horas_fecha ON horas_extras(fecha);
CREATE INDEX idx_horas_empresa ON horas_extras(empresa_id);

COMMENT ON TABLE horas_extras IS 'Registro de horas extras trabajadas por empleado';
COMMENT ON COLUMN horas_extras.tipo IS 'DIURNA (25%), FESTIVA (75%), NOCTURNA (35%)';

-- 7. TABLA: otros_pagos
-- Registro de otros pagos y deducciones adicionales
CREATE TABLE IF NOT EXISTS otros_pagos (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'INGRESO' CHECK (tipo IN ('INGRESO', 'DEDUCCION')),
    aprobado BOOLEAN DEFAULT FALSE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT fk_pagos_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    CONSTRAINT fk_pagos_periodo FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    CONSTRAINT fk_pagos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_pagos_empleado ON otros_pagos(empleado_id);
CREATE INDEX idx_pagos_periodo ON otros_pagos(periodo_id);
CREATE INDEX idx_pagos_tipo ON otros_pagos(tipo);
CREATE INDEX idx_pagos_empresa ON otros_pagos(empresa_id);

COMMENT ON TABLE otros_pagos IS 'Otros pagos o deducciones no recurrentes';

-- 8. TABLA: parametros_nomina
-- Parámetros y valores configurables del sistema de nómina
CREATE TABLE IF NOT EXISTS parametros_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    anio INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    CONSTRAINT fk_parametros_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_parametros_codigo ON parametros_nomina(codigo);
CREATE INDEX idx_parametros_anio ON parametros_nomina(anio);
CREATE INDEX idx_parametros_empresa ON parametros_nomina(empresa_id);

COMMENT ON TABLE parametros_nomina IS 'Parámetros configurables como SMMLV, Auxilio de Transporte, etc.';

-- Insertar parámetros iniciales para 2025
INSERT INTO parametros_nomina (codigo, nombre, descripcion, valor, anio, empresa_id) VALUES
('SMMLV_2025', 'Salario Mínimo 2025', 'Salario Mínimo Mensual Legal Vigente para 2025', 1423500, 2025, 1),
('AUX_TRANS_2025', 'Auxilio Transporte 2025', 'Auxilio de transporte mensual para 2025', 200000, 2025, 1),
('PORC_SALUD', 'Porcentaje Salud', 'Porcentaje de aporte a salud del empleado', 4, 2025, 1),
('PORC_PENSION', 'Porcentaje Pensión', 'Porcentaje de aporte a pensión del empleado', 4, 2025, 1)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Resumen de nómina por período
CREATE OR REPLACE VIEW vista_resumen_nomina_periodo AS
SELECT
    p.id AS periodo_id,
    p.nombre AS periodo,
    p.fecha_inicio,
    p.fecha_fin,
    p.estado AS estado_periodo,
    COUNT(n.id) AS total_empleados,
    SUM(n.total_devengado) AS total_devengado,
    SUM(n.total_deducciones) AS total_deducciones,
    SUM(n.neto_pagar) AS total_neto,
    p.empresa_id
FROM periodos_nomina p
LEFT JOIN nominas n ON p.id = n.periodo_id
GROUP BY p.id, p.nombre, p.fecha_inicio, p.fecha_fin, p.estado, p.empresa_id;

-- Vista: Detalle completo de nómina
CREATE OR REPLACE VIEW vista_detalle_completo_nomina AS
SELECT
    n.id AS nomina_id,
    p.nombre AS periodo,
    p.fecha_inicio,
    p.fecha_fin,
    e.cedula,
    e.nombre_completo AS empleado,
    n.salario_mensual,
    n.valor_hora,
    n.dias_pagados,
    n.total_devengado,
    n.total_deducciones,
    n.neto_pagar,
    n.estado,
    n.empresa_id
FROM nominas n
INNER JOIN periodos_nomina p ON n.periodo_id = p.id
INNER JOIN empleados e ON n.empleado_id = e.id;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función: Calcular valor de hora extra
CREATE OR REPLACE FUNCTION calcular_valor_hora_extra(
    p_valor_hora DECIMAL(12, 4),
    p_tipo VARCHAR(20)
) RETURNS DECIMAL(12, 2) AS $$
BEGIN
    CASE p_tipo
        WHEN 'DIURNA' THEN RETURN p_valor_hora * 1.25;
        WHEN 'FESTIVA' THEN RETURN p_valor_hora * 1.75;
        WHEN 'NOCTURNA' THEN RETURN p_valor_hora * 1.35;
        ELSE RETURN p_valor_hora;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================

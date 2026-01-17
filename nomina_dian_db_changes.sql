-- Cambios en Base de Datos para Nómina Electrónica DIAN
-- Basado en nomina.json

-- 1. Tabla: empleados
-- Se agregan campos para nombres detallados, tipos de trabajador/contrato, ubicación y datos bancarios
ALTER TABLE empleados
ADD COLUMN primer_apellido VARCHAR(100),
ADD COLUMN segundo_apellido VARCHAR(100),
ADD COLUMN primer_nombre VARCHAR(100),
ADD COLUMN otros_nombres VARCHAR(100),
ADD COLUMN tipo_documento_id INTEGER,       -- Correspondiente a 'codigos' de tipo documento DIAN
ADD COLUMN tipo_trabajador_id INTEGER,      -- Correspondiente a '01', '02', etc.
ADD COLUMN subtipo_trabajador_id INTEGER,   -- Correspondiente a '00', '01' (Pensionado? etc)
ADD COLUMN tipo_contrato_id INTEGER,        -- Correspondiente a '01' (Termino fijo), etc.
ADD COLUMN municipio_id INTEGER,            -- Código de municipio
ADD COLUMN direccion VARCHAR(255),          -- Sobrescribe o complementa si ya existe en otro lado
ADD COLUMN alto_riesgo_pension BOOLEAN DEFAULT FALSE,
ADD COLUMN salario_integral BOOLEAN DEFAULT FALSE,
ADD COLUMN metodo_pago_id INTEGER,          -- '10' (Efectivo), '47' (Transferencia), etc.
ADD COLUMN banco VARCHAR(100),
ADD COLUMN tipo_cuenta VARCHAR(50),         -- 'AHORROS', 'CORRIENTE'
ADD COLUMN numero_cuenta VARCHAR(50);

-- 2. Tabla: empresas
-- Se agregan datos de establecimiento requeridos
ALTER TABLE empresas
ADD COLUMN municipio_id INTEGER,
ADD COLUMN tipo_documento_id INTEGER,       -- '31' (NIT), etc.
ADD COLUMN email_contacto VARCHAR(255);     -- establishment_email en el JSON

-- 3. Tabla: conceptos_nomina
-- Se agrega campo para mapear el código interno con el tag/código DIAN (ej. 'HED', 'SALUD', 'BASICO')
ALTER TABLE conceptos_nomina
ADD COLUMN codigo_dian VARCHAR(50);

-- 4. Tabla: horas_extras
-- Se agregan tiempos exactos requeridos para el reporte de horas extras
ALTER TABLE horas_extras
ADD COLUMN hora_inicio TIMESTAMP,
ADD COLUMN hora_fin TIMESTAMP;

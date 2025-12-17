# Propuesta de Sistema de Nómina para Colombia

## Análisis del Archivo Excel

Basándome en el archivo `calcular nomina.xlsx`, el sistema actual maneja:

- **Períodos**: 3 períodos por mes (1-10, 11-20, 21-31)
- **Empleados**: 4 empleados con diferentes salarios
- **Conceptos**: Salario básico, horas extras (diurnas y festivas), otros pagos, auxilio de transporte
- **Deducciones**: Salud (4%), Pensión (4%), Otras deducciones

## Tablas Necesarias

### 1. **empleados**
Almacena información básica de los empleados.

```sql
CREATE TABLE empleados (
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
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### 2. **periodos_nomina**
Define los períodos de pago (quincenas o períodos de 10 días).

```sql
CREATE TABLE periodos_nomina (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej: "Primera quincena Diciembre 2025"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_periodo INTEGER NOT NULL, -- Días del período (15, 10, etc.)
    estado VARCHAR(20) DEFAULT 'ABIERTO', -- ABIERTO, CERRADO, PAGADO
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_cierre TIMESTAMP,
    fecha_pago TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### 3. **conceptos_nomina**
Catálogo de conceptos que pueden aplicarse en la nómina.

```sql
CREATE TABLE conceptos_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL, -- DEVENGADO, DEDUCCION
    subtipo VARCHAR(30), -- BASICO, HORA_EXTRA_DIURNA, HORA_EXTRA_FESTIVA, AUXILIO_TRANSPORTE, SALUD, PENSION, OTRO
    formula TEXT, -- Fórmula de cálculo (opcional)
    porcentaje DECIMAL(5, 2), -- Para deducciones porcentuales
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INTEGER NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### 4. **nominas**
Encabezado de nómina por período.

```sql
CREATE TABLE nominas (
    id SERIAL PRIMARY KEY,
    periodo_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    salario_mensual DECIMAL(12, 2) NOT NULL, -- Guardamos el salario del momento
    valor_hora DECIMAL(12, 4) NOT NULL, -- Calculado: salario_mensual / 220
    dias_pagados INTEGER NOT NULL,
    total_devengado DECIMAL(12, 2) DEFAULT 0,
    total_deducciones DECIMAL(12, 2) DEFAULT 0,
    neto_pagar DECIMAL(12, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'BORRADOR', -- BORRADOR, APROBADO, PAGADO
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_aprobacion TIMESTAMP,
    usuario_aprobacion INTEGER,
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    UNIQUE (periodo_id, empleado_id)
);
```

### 5. **nomina_detalle**
Detalle de conceptos aplicados en cada nómina.

```sql
CREATE TABLE nomina_detalle (
    id SERIAL PRIMARY KEY,
    nomina_id INTEGER NOT NULL,
    concepto_id INTEGER NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1, -- Para horas extras, días, etc.
    valor_unitario DECIMAL(12, 2),
    valor_total DECIMAL(12, 2) NOT NULL,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    FOREIGN KEY (nomina_id) REFERENCES nominas(id) ON DELETE CASCADE,
    FOREIGN KEY (concepto_id) REFERENCES conceptos_nomina(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### 6. **horas_extras**
Registro de horas extras trabajadas.

```sql
CREATE TABLE horas_extras (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- DIURNA, FESTIVA, NOCTURNA
    cantidad_horas DECIMAL(5, 2) NOT NULL,
    valor_hora DECIMAL(12, 2) NOT NULL,
    valor_total DECIMAL(12, 2) NOT NULL,
    aprobado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### 7. **otros_pagos**
Registro de otros pagos (bonificaciones, comisiones, etc.).

```sql
CREATE TABLE otros_pagos (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'INGRESO', -- INGRESO, DEDUCCION
    aprobado BOOLEAN DEFAULT FALSE,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

## Cálculos Principales

### 1. Salario Básico del Período
```
salario_basico_periodo = (salario_mensual / 30) * dias_periodo
```

Para quincena (15 días):
```
salario_basico_periodo = salario_mensual / 2
```

### 2. Valor Hora
```
valor_hora = salario_mensual / 220  // 220 horas mensuales estándar en Colombia
```

### 3. Horas Extras Diurnas (H.E.D)
Recargo del 25% sobre valor hora normal:
```
valor_hed = valor_hora * 1.25
```

### 4. Horas Extras Festivas (H.E.F)
Recargo del 75% sobre valor hora normal:
```
valor_hef = valor_hora * 1.75
```

### 5. Deducciones
- **Salud**: 4% del salario básico
- **Pensión**: 4% del salario básico

```
deduccion_salud = salario_basico_periodo * 0.04
deduccion_pension = salario_basico_periodo * 0.04
```

### 6. Auxilio de Transporte
Aplica solo si el salario es menor o igual a 2 salarios mínimos.
Valor actual 2025: ~$200,000 (valor proporcional al período)

```
if (salario_mensual <= (smmlv * 2)) {
    aux_transporte = (auxilio_transporte_mensual / 30) * dias_periodo
}
```

### 7. Total Devengado
```
total_devengado = salario_basico_periodo + hed_total + hef_total + otros_pagos + aux_transporte
```

### 8. Total Deducciones
```
total_deducciones = deduccion_salud + deduccion_pension + otras_deducciones
```

### 9. Neto a Pagar
```
neto_pagar = total_devengado - total_deducciones
```

## Flujo de Trabajo Propuesto

### 1. Configuración Inicial
- Crear empleados con sus salarios
- Crear conceptos de nómina (devengados y deducciones)

### 2. Por Cada Período
1. **Crear período de nómina** (del 1-15 o 16-30/31)
2. **Generar nóminas**: Crear registro de nómina para cada empleado activo
3. **Registrar novedades**:
   - Horas extras trabajadas
   - Otros pagos (bonificaciones, comisiones)
   - Deducciones adicionales
4. **Calcular nómina**: Ejecutar cálculos automáticos
5. **Revisar y aprobar**: Verificar cálculos
6. **Cerrar período**: Marcar como cerrado
7. **Registrar pago**: Actualizar estado a PAGADO

## Consideraciones Adicionales

### Variables del Sistema
Deberías tener una tabla para valores que cambian anualmente:

```sql
CREATE TABLE parametros_nomina (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    anio INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Ejemplos de parámetros:
-- SMMLV_2025 = 1423500
-- AUX_TRANSPORTE_2025 = 200000
-- PORCENTAJE_SALUD = 4
-- PORCENTAJE_PENSION = 4
```

### Reportes Necesarios
1. **Nómina individual**: Desprendible de pago por empleado
2. **Nómina consolidada**: Listado de todos los empleados del período
3. **Resumen de deducciones**: Para pagos a seguridad social
4. **Horas extras**: Reporte de horas trabajadas
5. **Histórico**: Nóminas pagadas por empleado

### Integraciones Futuras
- **PILA**: Planilla Integrada de Liquidación de Aportes
- **Declaración de retención en la fuente**
- **Certificados laborales**
- **Vacaciones y cesantías** (prestaciones sociales)

## Ejemplo de Uso

```sql
-- 1. Crear período
INSERT INTO periodos_nomina (nombre, fecha_inicio, fecha_fin, dias_periodo, empresa_id)
VALUES ('Primera quincena Diciembre 2025', '2025-12-01', '2025-12-15', 15, 1);

-- 2. Generar nóminas para empleados activos
INSERT INTO nominas (periodo_id, empleado_id, salario_mensual, valor_hora, dias_pagados, empresa_id)
SELECT
    1, -- periodo_id
    id,
    salario_mensual,
    salario_mensual / 220,
    15,
    empresa_id
FROM empleados
WHERE activo = TRUE AND empresa_id = 1;

-- 3. Calcular salario básico y deducciones automáticamente
-- (Esto se haría mediante lógica de backend)
```

## Próximos Pasos

1. ✅ **Entidades TypeORM creadas** - Todas las entidades necesarias están implementadas
2. ✅ **Backend NestJS implementado** - Módulo de nóminas con cálculo automático
3. ✅ **Frontend Vue implementado** - Páginas para listar y ver nóminas
4. ✅ **Cálculo automático** - Implementado para períodos de 15 días y otros períodos
5. ⏳ **Reportes PDF** - Pendiente de implementar
6. ⏳ **Módulos adicionales** - Horas extras y otros pagos (opcional)

## Estado de Implementación

### ✅ Completado

#### Backend
- ✅ Entidades: `nomina`, `nomina_detalle`, `hora_extra`, `otro_pago`, `parametro_nomina`
- ✅ Módulo `NominasModule` con controlador y servicio
- ✅ Servicio de cálculo automático que incluye:
  - Salario básico proporcional (15 días = salario/2, otros = (salario/30) * días)
  - Horas extras (diurnas 25%, festivas 75%)
  - Auxilio de transporte proporcional
  - Deducciones (salud 4%, pensión 4%)
  - Otros pagos y deducciones
- ✅ Endpoints REST:
  - `GET /nominas` - Listar nóminas
  - `GET /nominas/:id` - Ver detalle
  - `POST /nominas` - Crear nómina
  - `POST /nominas/generar/:periodoId` - Generar nóminas para período
  - `POST /nominas/calcular` - Calcular nómina
  - `PUT /nominas/:id/aprobar` - Aprobar nómina
  - `PUT /nominas/:id/pagar` - Marcar como pagado

#### Frontend
- ✅ `NominasPage.vue` - Listado de nóminas con filtros
- ✅ `ViewNominaPage.vue` - Vista detallada con desglose
- ✅ Servicio API `nomina.service.ts`
- ✅ Tipos TypeScript `nomina.ts`
- ✅ Rutas configuradas en router

### ⏳ Pendiente (Opcional)

- Módulos CRUD para horas extras y otros pagos
- Reportes PDF de nómina
- Exportación a Excel mejorada
- Vista de desprendible de pago

Por favor indícame qué te gustaría implementar primero.

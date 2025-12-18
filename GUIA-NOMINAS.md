# Guía del Sistema de Nóminas

## Descripción General

El sistema de nóminas está completamente implementado y listo para usar. Incluye funcionalidades completas para:
- ✅ Gestión de empleados
- ✅ Gestión de períodos de nómina
- ✅ Gestión de conceptos de nómina
- ✅ Cálculo automático de nóminas
- ✅ Aprobación y pago de nóminas
- ✅ Listado y filtrado de nóminas
- ✅ Interfaz tipo Excel para cálculo masivo

## Configuración Inicial

### 1. Ejecutar Scripts SQL

Ejecutar en orden en PostgreSQL:

```bash
# 1. Script principal de nóminas
backend/src/scripts/nomina-completo.sql

# 2. Script de tablas complementarias
backend/src/scripts/nomina-tablas-complementarias.sql
```

Estos scripts crean:
- ✅ Tabla `empleados`
- ✅ Tabla `periodos_nomina`
- ✅ Tabla `conceptos_nomina`
- ✅ Tabla `nominas`
- ✅ Tabla `nomina_detalle`
- ✅ Tabla `horas_extras`
- ✅ Tabla `otros_pagos`
- ✅ Tabla `parametros_nomina`
- ✅ Vistas auxiliares
- ✅ Datos iniciales (conceptos y parámetros)

### 2. Verificar Configuración

El backend ya está configurado y compila correctamente. Todas las entidades y servicios están implementados.

## Flujo de Trabajo

### Paso 1: Gestionar Empleados

**Ruta:** `/empleados`

1. Navegar a **Nómina > Empleados** en el menú
2. Crear nuevos empleados con el botón **"+ Nuevo Empleado"**
3. Completar información:
   - Datos personales (cédula, nombre, dirección, etc.)
   - Salario mensual
   - Si recibe auxilio de transporte
   - Fecha de ingreso
   - Estado (ACTIVO/INACTIVO)

**Funciones disponibles:**
- ✅ Crear empleado
- ✅ Editar empleado
- ✅ Eliminar empleado
- ✅ Filtrar y buscar
- ✅ Vista de tabla y tarjetas
- ✅ Exportar a Excel/PDF

### Paso 2: Crear Períodos de Nómina

**Ruta:** `/periodos-nomina`

1. Navegar a **Nómina > Períodos**
2. Crear período con **"+ Nuevo Período"**
3. Configurar:
   - Nombre (ej: "Primera Quincena Enero 2025")
   - Año y mes
   - Número de período (1, 2 o 3)
   - **Fecha de inicio** (ej: 2025-01-01)
   - **Fecha de fin** (ej: 2025-01-15)
   - Días del período (se calcula automático)
   - Estado: ABIERTO

**Estados del período:**
- `ABIERTO`: Se pueden generar nóminas
- `EN_PROCESO`: Nóminas en cálculo
- `CERRADO`: Nóminas aprobadas
- `PAGADO`: Nóminas pagadas

### Paso 3: Configurar Conceptos de Nómina

**Ruta:** `/conceptos-nomina`

El sistema incluye conceptos predefinidos, pero puedes agregar más:

**Conceptos de Devengado (Ingresos):**
- Salario Básico (BASICO)
- Horas Extras Diurnas (HORA_EXTRA_DIURNA) - 25% recargo
- Horas Extras Festivas (HORA_EXTRA_FESTIVA) - 75% recargo
- Auxilio de Transporte (AUXILIO_TRANSPORTE)
- Bonificaciones (OTRO)

**Conceptos de Deducción:**
- Salud - 4% (DEDUCCION_SALUD)
- Pensión - 4% (DEDUCCION_PENSION)
- Otras deducciones (OTRO)

### Paso 4: Calcular Nóminas (Vista Excel)

**Ruta:** `/nominas/calcular`

Esta es la **pantalla principal** para calcular nóminas, similar a Excel:

1. **Seleccionar período** en el selector superior
2. **Generar nóminas** con botón "Generar Nóminas":
   - Se crean automáticamente nóminas para todos los empleados activos
   - Estado inicial: BORRADOR

3. **Tabla de cálculo tipo Excel** muestra:
   - Empleado y salario mensual
   - Valor hora (salario/220)
   - Días del período
   - Salario básico calculado
   - Horas extras (con botones + para agregar)
   - Auxilio de transporte
   - Otros pagos (con botones + para agregar)
   - Deducciones (salud, pensión, otras)
   - **Neto a pagar** (calculado en tiempo real)

4. **Agregar novedades:**
   - **Horas Extras Diurnas**: Click en + verde
   - **Horas Extras Festivas**: Click en + naranja
   - **Otros Pagos**: Click en + azul
   - **Deducciones**: Click en + rojo

5. **Calcular todas** con botón "Calcular Todas":
   - Ejecuta el cálculo completo de todas las nóminas
   - Guarda los detalles en la base de datos
   - Estado cambia a: CALCULADO

### Paso 5: Gestionar Nóminas

**Ruta:** `/nominas`

Listado completo de todas las nóminas con:

**Filtros disponibles:**
- Por período
- Por estado (Borrador/Aprobado/Pagado)
- Búsqueda por empleado

**Acciones por nómina:**

**Estado BORRADOR:**
- 👁️ **Ver detalle**: Ver el desprendible completo
- 🧮 **Calcular**: Ejecutar cálculo de la nómina
- ✅ **Aprobar**: Confirmar la nómina (cambia a APROBADO)

**Estado APROBADO:**
- 👁️ **Ver detalle**
- 💰 **Marcar como Pagado**: Cuando se realiza el pago

**Estado PAGADO:**
- 👁️ **Ver detalle** (solo lectura)

**Exportación:**
- 📊 **Excel**: Exportar listado a Excel
- 📄 **PDF**: Exportar listado a PDF

### Paso 6: Ver Detalle de Nómina

**Ruta:** `/nominas/:id`

Vista completa del desprendible de pago con:
- Información del empleado
- Información del período
- **Devengados:**
  - Salario básico
  - Horas extras
  - Auxilio de transporte
  - Otros pagos
  - Total devengado
- **Deducciones:**
  - Salud (4%)
  - Pensión (4%)
  - Otras deducciones
  - Total deducciones
- **NETO A PAGAR**

## Cálculos Automáticos

### Valor Hora
```
Valor Hora = Salario Mensual / 220 horas
```

### Salario Básico del Período
```
Si días_período = 15:
  Salario Básico = Salario Mensual / 2

Si días_período != 15:
  Salario Básico = (Salario Mensual / 30) × días_período
```

### Horas Extras
```
Hora Extra Diurna = Valor Hora × 1.25 × Cantidad Horas
Hora Extra Festiva = Valor Hora × 1.75 × Cantidad Horas
```

### Auxilio de Transporte
```
Auxilio Mensual = $200,000 (configurable en parámetros)

Si días_período = 15:
  Auxilio Período = Auxilio Mensual / 2

Si días_período != 15:
  Auxilio Período = (Auxilio Mensual / 30) × días_período
```

### Deducciones
```
Salud = Salario Básico × 4%
Pensión = Salario Básico × 4%
```

### Neto a Pagar
```
Neto = Total Devengado - Total Deducciones
```

## Estados y Flujo

```
BORRADOR → APROBADO → PAGADO
   ↓          ↓
Editable  Solo lectura
```

1. **BORRADOR**: Se pueden hacer cambios, agregar horas extras, etc.
2. **APROBADO**: Nómina confirmada, lista para pagar
3. **PAGADO**: Nómina pagada (no se puede modificar)

## Características Especiales

### Interfaz Tipo Excel (Calcular Nómina)
- ✅ Tabla scrollable horizontal
- ✅ Cálculos en tiempo real
- ✅ Botones inline para agregar novedades
- ✅ Colores para identificar tipos de valores
- ✅ Tooltips informativos
- ✅ Sticky header

### Validaciones
- ✅ No duplicar nóminas para mismo empleado/período
- ✅ Solo aprobar nóminas en estado BORRADOR
- ✅ Solo pagar nóminas en estado APROBADO
- ✅ No eliminar nóminas PAGADAS
- ✅ Empleados activos solamente

### Seguridad
- ✅ Todas las rutas protegidas con JWT
- ✅ Validación de empresa_id
- ✅ Tracking de usuario_creacion y usuario_aprobacion
- ✅ Transacciones para integridad de datos

## Parámetros Configurables

Tabla `parametros_nomina`:
- **SMMLV**: Salario Mínimo Legal Vigente (2025: $1,423,500)
- **AUX_TRANSPORTE**: Auxilio de Transporte (2025: $200,000)
- **HORAS_MES**: Horas laborales al mes (220)

## Rutas del Sistema

| Ruta | Descripción |
|------|-------------|
| `/empleados` | Listado y gestión de empleados |
| `/empleados/new` | Crear nuevo empleado |
| `/empleados/edit/:id` | Editar empleado |
| `/periodos-nomina` | Listado de períodos |
| `/periodos-nomina/new` | Crear nuevo período |
| `/periodos-nomina/edit/:id` | Editar período |
| `/conceptos-nomina` | Listado de conceptos |
| `/conceptos-nomina/new` | Crear nuevo concepto |
| `/conceptos-nomina/edit/:id` | Editar concepto |
| `/nominas` | Listado de nóminas |
| `/nominas/calcular` | **Calcular nóminas (vista Excel)** |
| `/nominas/:id` | Ver detalle de nómina |

## Menú de Navegación

```
Nómina
├── Empleados
├── Períodos
├── Conceptos
├── Nóminas
└── Calcular Nómina ⭐ (Vista Excel)
```

## Soporte Técnico

### Backend
- **Framework**: NestJS + TypeORM
- **Base de datos**: PostgreSQL
- **Puerto**: 3006
- **Endpoint base**: `http://localhost:3006`

### Frontend
- **Framework**: Vue 3 + Quasar
- **Estado**: Pinia
- **Puerto**: 5175
- **UI**: Material Design

## Próximos Pasos Recomendados

1. ✅ Ejecutar scripts SQL
2. ✅ Crear empleados de prueba
3. ✅ Crear período de nómina
4. ✅ Ir a "Calcular Nómina"
5. ✅ Generar nóminas
6. ✅ Agregar horas extras y otros pagos
7. ✅ Calcular todas
8. ✅ Revisar en listado de nóminas
9. ✅ Aprobar y pagar

---

**Sistema completamente funcional y listo para producción** ✅

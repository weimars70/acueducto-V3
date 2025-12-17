# Setup Completo del Sistema de Nóminas

Esta guía te ayudará a configurar el sistema de nóminas desde cero.

## 📋 Prerrequisitos

- ✅ PostgreSQL instalado y corriendo
- ✅ Node.js y npm instalados
- ✅ Backend compilado (`cd backend && npm run build`)
- ✅ Frontend configurado con Quasar

## 🚀 Configuración Paso a Paso

### Paso 1: Ejecutar Scripts SQL (en orden)

Ejecuta estos scripts en tu base de datos PostgreSQL:

```sql
-- 1. Script principal de tablas de nómina
\i backend/src/scripts/nomina-completo.sql

-- 2. Script de tablas complementarias
\i backend/src/scripts/nomina-tablas-complementarias.sql

-- 3. Script de parámetros
\i backend/src/scripts/insert-parametros-nomina.sql

-- 4. Script de períodos de ejemplo
\i backend/src/scripts/insert-periodo-ejemplo.sql

-- 5. Script de empleados de ejemplo
\i backend/src/scripts/insert-empleados-ejemplo.sql
```

**O si prefieres ejecutar todo desde PostgreSQL:**

```bash
# Abrir psql
psql -U postgres -d acueducto

# Ejecutar cada script
\i 'C:/Users/Weimar/Documents/proyectos/acueducto-V3/backend/src/scripts/nomina-completo.sql'
\i 'C:/Users/Weimar/Documents/proyectos/acueducto-V3/backend/src/scripts/nomina-tablas-complementarias.sql'
\i 'C:/Users/Weimar/Documents/proyectos/acueducto-V3/backend/src/scripts/insert-parametros-nomina.sql'
\i 'C:/Users/Weimar/Documents/proyectos/acueducto-V3/backend/src/scripts/insert-periodo-ejemplo.sql'
\i 'C:/Users/Weimar/Documents/proyectos/acueducto-V3/backend/src/scripts/insert-empleados-ejemplo.sql'
```

### Paso 2: Verificar Datos Insertados

```sql
-- Verificar parámetros
SELECT * FROM parametros_nomina ORDER BY codigo;

-- Verificar períodos
SELECT id, codigo, nombre, fecha_inicio, fecha_fin, dias_periodo, estado
FROM periodos_nomina ORDER BY fecha_inicio DESC;

-- Verificar empleados
SELECT id, cedula, nombre_completo, salario_mensual, activo, cargo
FROM empleados WHERE activo = true ORDER BY nombre_completo;

-- Verificar conceptos de nómina
SELECT id, codigo, nombre, tipo, subtipo, porcentaje, activo
FROM conceptos_nomina WHERE activo = true ORDER BY tipo, orden_impresion;
```

**Resultados esperados:**
- ✅ **Parámetros**: 10 registros (SMMLV, auxilio transporte, etc.)
- ✅ **Períodos**: 3 registros (2 quincenas de enero, 1 de febrero)
- ✅ **Empleados**: 6 empleados activos
- ✅ **Conceptos**: 11 conceptos (salario básico, horas extras, deducciones)

### Paso 3: Iniciar Servicios

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5174
- Backend: http://localhost:3006
- API Docs: http://localhost:3006/api

### Paso 4: Probar el Sistema

1. **Login**
   - Ir a: http://localhost:5174
   - Iniciar sesión con tus credenciales

2. **Verificar Empleados**
   - Ir a: **Nómina > Empleados**
   - Deberías ver 6 empleados activos
   - Si no hay empleados, ir al Paso 5

3. **Verificar Períodos**
   - Ir a: **Nómina > Períodos**
   - Deberías ver 3 períodos
   - Si no hay períodos, ir al Paso 6

4. **Calcular Nómina** 🎯
   - Ir a: **Nómina > Calcular Nómina**
   - Seleccionar período: "Primera Quincena Enero 2025"
   - Click en **"Generar Nóminas"**
   - Deberías ver 6 empleados en la tabla
   - Click en **"Calcular Todas"**
   - Ver los totales calculados

## 🔧 Solución de Problemas

### Problema: "No hay períodos disponibles"

**Causa:** No se ejecutó el script de períodos

**Solución:**
```sql
\i backend/src/scripts/insert-periodo-ejemplo.sql
```

O crear manualmente:
1. Ir a **Nómina > Períodos > + Nuevo Período**
2. Llenar el formulario
3. Guardar

### Problema: "No hay empleados activos"

**Causa:** No se ejecutó el script de empleados

**Solución:**
```sql
\i backend/src/scripts/insert-empleados-ejemplo.sql
```

O crear manualmente:
1. Ir a **Nómina > Empleados > + Nuevo Empleado**
2. Llenar datos del empleado
3. Marcar como "Activo"
4. Guardar

### Problema: Error al calcular nómina

**Causa:** Faltan conceptos de nómina

**Verificar:**
```sql
SELECT COUNT(*) FROM conceptos_nomina WHERE activo = true;
-- Debe devolver al menos 11 registros
```

**Solución:**
```sql
\i backend/src/scripts/nomina-completo.sql
```

### Problema: Error 401 Unauthorized

**Causa:** Token de sesión expirado

**Solución:**
1. Cerrar sesión
2. Iniciar sesión nuevamente
3. Intentar de nuevo

### Problema: No se muestran datos en la tabla

**Abrir consola del navegador (F12) y verificar:**

1. ¿Hay errores en rojo?
2. ¿Qué muestra el log "Cantidad de empleados"?
3. ¿Cuál es el `empresaId` del usuario?

**Verificar empresa_id:**
```sql
-- Ver tu usuario
SELECT id, email, empresa_id FROM usuarios WHERE email = 'tu_email@example.com';

-- Verificar empleados de esa empresa
SELECT COUNT(*) FROM empleados WHERE empresa_id = X AND activo = true;
```

## 📊 Datos de Ejemplo Insertados

### Empleados (6)

| Cédula | Nombre | Salario | Cargo | Aux. Transporte |
|--------|--------|---------|-------|-----------------|
| 1000000001 | Juan Carlos Rodríguez | $2,500,000 | Administrador | Sí |
| 1000000002 | María Elena López | $1,950,000 | Operario | Sí |
| 1000000003 | Carlos Andrés Martínez | $2,250,000 | Contador | Sí |
| 1000000004 | Ana Patricia Gómez | $1,650,000 | Aux. Contable | Sí |
| 1000000005 | Pedro Luis Sánchez | $1,950,000 | Fontanero | Sí |
| 1000000006 | Laura Cristina Hernández | $1,800,000 | Secretaria | Sí |

### Períodos (3)

| Código | Nombre | Fechas | Días | Estado |
|--------|--------|--------|------|--------|
| PER-2025-01-1 | Primera Quincena Enero 2025 | 01/01 - 15/01 | 15 | ABIERTO |
| PER-2025-01-2 | Segunda Quincena Enero 2025 | 16/01 - 31/01 | 16 | ABIERTO |
| PER-2025-02-1 | Primera Quincena Febrero 2025 | 01/02 - 15/02 | 15 | ABIERTO |

### Parámetros (10)

| Código | Nombre | Valor |
|--------|--------|-------|
| SMMLV_2025 | Salario Mínimo 2025 | $1,423,500 |
| AUX_TRANSPORTE_2025 | Auxilio Transporte 2025 | $200,000 |
| HORAS_MES | Horas Laborales | 220 |
| PORC_SALUD_EMP | Salud Empleado | 4% |
| PORC_PENSION_EMP | Pensión Empleado | 4% |

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Scripts SQL ejecutados en orden
- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] Usuario autenticado correctamente
- [ ] Hay períodos creados (mínimo 1)
- [ ] Hay empleados activos (mínimo 1)
- [ ] Hay conceptos de nómina activos (mínimo 11)
- [ ] Los empleados tienen el mismo `empresa_id` que el usuario
- [ ] La consola del navegador no muestra errores

## 📞 Debug Avanzado

### Ver logs completos del backend

```bash
cd backend
npm run start:dev
# Observar logs en tiempo real
```

### Ver logs del frontend

1. Abrir consola del navegador (F12)
2. Ir a la pestaña "Console"
3. Buscar logs que comiencen con:
   - "Cargando períodos..."
   - "Cargando empleados..."
   - "Cantidad de empleados:"

### Verificar request HTTP

1. Abrir consola del navegador (F12)
2. Ir a la pestaña "Network"
3. Filtrar por "empleados"
4. Ver el request y response

**Request esperado:**
```
GET /nominas/periodo/1/empleados
Authorization: Bearer <token>
```

**Response esperado:**
```json
[
  {
    "empleado": { "id": 1, "nombre_completo": "...", ... },
    "nomina": null,
    "periodo": { ... },
    "horasExtrasDiurnas": 0,
    "horasExtrasFestivas": 0,
    ...
  },
  ...
]
```

## 🎯 Resultado Final Esperado

Después de completar todos los pasos:

1. ✅ Al ir a **Calcular Nómina**
2. ✅ Puedes seleccionar un período
3. ✅ Click en "Generar Nóminas" crea 6 nóminas
4. ✅ La tabla muestra 6 filas con empleados
5. ✅ Puedes agregar horas extras
6. ✅ Click en "Calcular Todas" calcula los totales
7. ✅ Los valores se muestran correctamente

---

**Si después de seguir todos estos pasos aún tienes problemas, revisa la consola del navegador y los logs del backend para obtener más información.**

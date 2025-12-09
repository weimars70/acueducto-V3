# Módulo de Ajustes de Inventario

Este módulo permite registrar ajustes manuales de inventario, tanto entradas (+) como salidas (-), manteniendo un historial completo de todos los cambios realizados.

## Características

- ✅ Registro de ajustes de entrada (+) y salida (-)
- ✅ Actualización automática del campo `inventario_actual` en la tabla `items`
- ✅ Historial completo de ajustes con inventario anterior y nuevo
- ✅ Validación para evitar inventarios negativos
- ✅ Registro automático en `movimientos_inventario`
- ✅ Estadísticas de ajustes (total, entradas, salidas)
- ✅ Interfaz moderna con diseño consistente
- ✅ Búsqueda de items con autocompletado
- ✅ Filtros por nombre de item y tipo de ajuste
- ✅ Vista en tiempo real del stock resultante

## Instalación

### 1. Crear la tabla en la base de datos

Ejecuta el siguiente script SQL en tu base de datos PostgreSQL:

```bash
psql -U postgres -d acueducto -f backend/create-ajustes-inventario-table.sql
```

O copia y ejecuta el contenido del archivo `backend/create-ajustes-inventario-table.sql` directamente en tu cliente PostgreSQL.

### 2. Verificar la instalación

El módulo ya está completamente integrado en el sistema:
- ✅ Backend: Módulo registrado en `AppModule`
- ✅ Frontend: Rutas agregadas al router
- ✅ Frontend: Servicio API creado
- ✅ Frontend: Páginas de listado y formulario

## Estructura del Módulo

### Backend

**Archivos creados:**
- `backend/src/entities/ajuste-inventario.entity.ts` - Entidad TypeORM
- `backend/src/ajustes-inventario/ajustes-inventario.module.ts` - Módulo NestJS
- `backend/src/ajustes-inventario/ajustes-inventario.controller.ts` - Controller REST
- `backend/src/ajustes-inventario/ajustes-inventario.service.ts` - Lógica de negocio
- `backend/src/ajustes-inventario/dto/create-ajuste-inventario.dto.ts` - DTO de validación

**Endpoints disponibles:**
- `GET /ajustes-inventario` - Lista ajustes con paginación y filtros
- `GET /ajustes-inventario/items?search=...` - Busca items para el formulario
- `GET /ajustes-inventario/estadisticas` - Obtiene estadísticas de ajustes
- `POST /ajustes-inventario` - Crea un nuevo ajuste

### Frontend

**Archivos creados:**
- `src/services/api/ajustes-inventario.service.ts` - Servicio API
- `src/pages/AjustesInventarioPage.vue` - Página de listado
- `src/pages/NewAjusteInventarioPage.vue` - Formulario de ajuste

**Ruta:** `/ajustes-inventario`

## Uso del Módulo

### Crear un Ajuste de Inventario

1. Navega a **Ajustes Inventario** desde el menú
2. Haz clic en **"Nuevo Ajuste"**
3. Selecciona el item a ajustar (puedes buscar por nombre o código)
4. Selecciona el tipo de ajuste:
   - **Entrada (+)**: Suma unidades al inventario
   - **Salida (-)**: Resta unidades del inventario
5. Ingresa la cantidad
6. Opcionalmente, agrega un motivo/observación
7. El sistema mostrará el stock resultante en tiempo real
8. Haz clic en **"Guardar Ajuste"**

### Validaciones

El sistema validará:
- ✅ Item seleccionado (requerido)
- ✅ Tipo de ajuste (+ o -)
- ✅ Cantidad mayor a 0
- ✅ Inventario resultante no negativo (para salidas)

### Visualizar Historial

La página principal muestra:
- **Estadísticas generales:**
  - Total de ajustes
  - Total de entradas
  - Total de salidas
- **Tabla de ajustes** con:
  - Fecha y hora
  - Item ajustado
  - Tipo de ajuste (badge con color)
  - Cantidad
  - Inventario anterior y nuevo
  - Motivo
  - Usuario que realizó el ajuste

### Filtros Disponibles

- **Por nombre de item**: Filtra por el nombre del item
- **Por tipo de ajuste**: Filtra por entradas (+) o salidas (-)

## Flujo Técnico

Cuando se crea un ajuste:

1. **Validaciones**
   - Verifica que el item existe
   - Valida que la cantidad es mayor a 0
   - Valida que el tipo de ajuste es '+' o '-'
   - Para salidas, valida que el inventario no quede negativo

2. **Cálculo**
   - Obtiene el inventario actual del item
   - Calcula el nuevo inventario según el tipo de ajuste

3. **Actualización de items**
   ```sql
   UPDATE public.items
   SET inventario_actual = [nuevo_inventario]
   WHERE id = [id_item] AND empresa_id = [empresa_id]
   ```

4. **Registro de ajuste**
   - Inserta en `ajustes_inventario` con:
     - Inventario anterior
     - Inventario nuevo
     - Tipo de ajuste
     - Cantidad
     - Motivo
     - Usuario y fecha

5. **Movimiento de inventario**
   - Inserta en `movimientos_inventario`:
     - `tipo_movimiento = 3` para entradas (ajuste +)
     - `tipo_movimiento = 4` para salidas (ajuste -)

Todo el proceso se ejecuta en una **transacción**, por lo que si algo falla, se hace rollback completo.

## Tipos de Movimiento

El sistema usa los siguientes códigos en `movimientos_inventario`:
- `1`: Compra (entrada)
- `2`: Salida/Venta
- `3`: Ajuste entrada (+)
- `4`: Ajuste salida (-)

## Permisos

Todos los endpoints requieren autenticación JWT (`@UseGuards(JwtAuthGuard)`).

## Integración con Otros Módulos

Este módulo se integra con:
- **Items**: Lee y actualiza el inventario actual
- **Movimientos Inventario**: Registra todos los movimientos

## Ejemplo de Respuesta

Al crear un ajuste exitoso, el sistema responde:

```json
{
  "ok": true,
  "mensaje": "Ajuste de inventario guardado correctamente",
  "id": 123,
  "inventarioAnterior": 100,
  "inventarioNuevo": 150
}
```

## Troubleshooting

### Error: "Item no encontrado"
- Verifica que el ID del item existe y pertenece a la empresa actual

### Error: "El ajuste resultaría en inventario negativo"
- Estás intentando hacer una salida (-) mayor al inventario actual
- Verifica el stock actual del item

### No aparece en el menú
- Verifica que el usuario esté autenticado
- La ruta está protegida con `JwtAuthGuard`

## Mantenimiento

### Agregar nuevos campos al historial
1. Agregar columna a la tabla `ajustes_inventario`
2. Actualizar la entidad `ajuste-inventario.entity.ts`
3. Actualizar el DTO `create-ajuste-inventario.dto.ts`
4. Actualizar el servicio para manejar el nuevo campo
5. Actualizar el frontend según sea necesario

### Cambiar tipos de movimiento
Edita los valores en `ajustes-inventario.service.ts`:
```typescript
const tipoMovimiento = tipoAjuste === '+' ? 3 : 4;
```

---

**Desarrollado para el sistema de acueductos V3**

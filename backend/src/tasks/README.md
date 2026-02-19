# Tareas Programadas (Scheduled Tasks)

## Exportación Mensual de Items

### Descripción
Tarea programada que se ejecuta automáticamente **el último día de cada mes a las 22:00 (hora de Colombia)**.

### Funcionalidad
1. **Exporta la tabla `items`** a un archivo Excel (.xlsx)
   - Nombre del archivo: `items_YYYY_MM.xlsx` (ejemplo: `items_2026_02.xlsx`)
   - Ubicación: `backend/exports/`
   - Incluye todas las columnas y registros de la tabla

2. **Crea una tabla de respaldo** en la base de datos
   - Nombre de la tabla: `items_YYYY_MM` (ejemplo: `items_2026_02`)
   - Contiene una copia exacta de todos los datos de la tabla `items` al momento de la ejecución

### Configuración del Cron
```typescript
@Cron('0 22 * * *', {
    name: 'export-items-monthly',
    timeZone: 'America/Bogota'
})
```

- `0 22 * * *` significa que la tarea se ejecuta **todos los días** a las 22:00.
- Internamente, la función verifica si el día actual es el **último día del mes**.
  - Si es el último día, ejecuta la exportación.
  - Si no es el último día, termina sin hacer nada.
- Esta estrategia se usa porque la librería `cron` no soporta el alias `L`.

### Ejecución Manual (Para Pruebas)

Puedes ejecutar la tarea manualmente sin esperar al último día del mes usando el endpoint:

**Endpoint:** `POST /tasks/export-items`

**Headers:**
```
Authorization: Bearer {tu_token_jwt}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3001/tasks/export-items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Tarea de exportación ejecutada exitosamente"
}
```

### Logs
La tarea genera logs detallados en la consola del backend:

```
🕒 Iniciando tarea programada: Exportación mensual de items
📊 Obteniendo datos de la tabla items...
📝 Creando archivo Excel: items_2026_02.xlsx
✅ Archivo Excel creado exitosamente: /path/to/backend/exports/items_2026_02.xlsx
🗄️ Creando tabla: items_2026_02
✅ Tabla items_2026_02 creada exitosamente con 150 registros
🎉 Tarea programada completada exitosamente
```

### Estructura de Archivos
```
backend/
├── src/
│   └── tasks/
│       ├── tasks.module.ts      # Módulo de tareas
│       ├── tasks.service.ts     # Lógica de la tarea programada
│       └── tasks.controller.ts  # Endpoint para ejecución manual
└── exports/                     # Directorio de archivos exportados
    ├── items_2026_01.xlsx
    ├── items_2026_02.xlsx
    └── ...
```

### Notas Importantes
- Si la tabla `items_YYYY_MM` ya existe, no se sobrescribe (se omite la creación)
- El directorio `exports/` se crea automáticamente si no existe
- Los archivos Excel se guardan con formato `.xlsx` (Excel 2007+)
- La tarea usa la zona horaria de Colombia (`America/Bogota`)

### Dependencias
- `@nestjs/schedule` - Módulo de NestJS para tareas programadas
- `node-cron` - Librería para expresiones cron
- `exceljs` - Librería para generar archivos Excel

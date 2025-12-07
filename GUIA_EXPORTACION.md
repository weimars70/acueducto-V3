# Guía para Implementar Exportación a Excel y PDF en Listados

Esta guía te ayudará a agregar botones de exportación a Excel y PDF en cualquier página de listado.

## Pasos a seguir:

### 1. Importar el composable en el script

Agrega la importación del composable `useExport`:

```typescript
import { useExport } from '../composables/useExport';
```

Y luego inicialízalo:

```typescript
const { exportToExcel, exportToPDF } = useExport();
```

### 2. Agregar las funciones de exportación

Agrega estas dos funciones antes del `onMounted`:

```typescript
const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      // Agrega más columnas según tu listado
    ];
    exportToExcel(filteredData.value, exportColumns, 'nombre_archivo');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      // Agrega más columnas según tu listado
    ];
    exportToPDF(filteredData.value, exportColumns, 'nombre_archivo', 'Título del PDF');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};
```

**Notas importantes:**
- Reemplaza `filteredData.value` con el nombre de tu computed property que contiene los datos filtrados
- Ajusta `exportColumns` según las columnas de tu tabla
- Cambia `'nombre_archivo'` por un nombre descriptivo
- Cambia `'Título del PDF'` por el título que quieras mostrar en el PDF

### 3. Agregar los botones en el template

Reemplaza el botón de "Nuevo" por este bloque de código:

```vue
<div class="row q-gutter-sm">
  <q-btn
    outline
    color="positive"
    icon="description"
    label="Excel"
    @click="handleExportExcel"
    no-caps
    class="export-btn"
  >
    <q-tooltip>Exportar a Excel</q-tooltip>
  </q-btn>
  <q-btn
    outline
    color="negative"
    icon="picture_as_pdf"
    label="PDF"
    @click="handleExportPDF"
    no-caps
    class="export-btn"
  >
    <q-tooltip>Exportar a PDF</q-tooltip>
  </q-btn>
  <q-btn
    color="primary"
    icon="add"
    label="Nuevo [Nombre]"
    to="/ruta/new"
    unelevated
    class="q-px-lg q-py-xs shadow-2"
    rounded
    no-caps
  />
</div>
```

### 4. Agregar los estilos CSS

Al final del bloque `<style scoped>`, agrega:

```css
.export-btn {
  min-width: 90px;
  height: 36px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## Ejemplo completo aplicado a CentroCostosPage:

### Script:
```typescript
import { useExport } from '../composables/useExport';

const { exportToExcel, exportToPDF } = useExport();

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' }
    ];
    exportToExcel(filteredData(), exportColumns, 'centros_costos');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' }
    ];
    exportToPDF(filteredData(), exportColumns, 'centros_costos', 'Listado de Centros de Costos');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};
```

## Listados pendientes de actualizar:

- [ ] CentroCostosPage.vue
- [ ] TercerosPage.vue
- [ ] BancosPage.vue
- [ ] CiudadesPage.vue
- [ ] ClientesPage.vue
- [ ] ImpuestosPage.vue
- [ ] MarcasMedidorPage.vue
- [ ] TarifasMaestroPage.vue
- [ ] TipoIdentPage.vue
- [ ] TipoImpuestoPage.vue
- [ ] TipoPersonaPage.vue
- [ ] TipoRegimenPage.vue
- [ ] YearsPage.vue
- [ ] ItemsGruposPage.vue
- [ ] ItemsPage.vue
- [ ] TipoMovimientoItemPage.vue
- [ ] EstratoPage.vue
- [ ] EstratosTipoPage.vue
- [ ] EstratosTarifasPage.vue
- [ ] ComprasPage.vue
- [ ] MovimientosInventarioPage.vue

## Notas adicionales:

- El composable `useExport` ya está creado en `src/composables/useExport.ts`
- Las librerías necesarias (`xlsx`, `jspdf`, `jspdf-autotable`) ya están instaladas
- Los botones de exportación aparecerán antes del botón "Nuevo" en cada listado
- Los archivos se descargarán automáticamente al hacer clic en los botones

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { salidasService } from '../services/api/salidas.service';
import type { CreateSalidaDto, ItemSalida, Cliente, ItemCatalogo } from '../types/salida-form';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const clientes = ref<Cliente[]>([]);
const clientesFiltered = ref<Cliente[]>([]);
const items = ref<ItemCatalogo[]>([]);
const itemsFiltered = ref<ItemCatalogo[]>([]);
const itemsTabla = ref<ItemSalida[]>([]);

// Formulario principal
const form = ref({
  cliente: null as number | null,
  plazo: 0,
  fecha: new Date().toISOString().split('T')[0],
  obs: ''
});

// Formulario de items
const itemForm = ref({
  item: null as number | null,
  cantidad: 1,
  psalida: 0,
  por_iva: 0,
  descuento: 0
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'nombre', label: 'Descripción', field: 'nombre', align: 'left' as const },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' as const },
  { name: 'psalida', label: 'Precio', field: 'psalida', align: 'right' as const },
  { name: 'por_iva', label: 'IVA%', field: 'por_iva', align: 'right' as const },
  { name: 'descuento', label: 'Desc%', field: 'descuento', align: 'right' as const },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const }
];

const loadClientes = async () => {
  try {
    clientes.value = await salidasService.getClientes();
    clientesFiltered.value = clientes.value;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar clientes'
    });
  }
};

const loadItems = async () => {
  try {
    items.value = await salidasService.getItems();
    itemsFiltered.value = items.value;
  } catch (error) {
    console.error('Error al cargar items:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar items'
    });
  }
};

const filterClientes = async (val: string, update: (callback: () => void) => void) => {
  if (val.length < 3) {
    update(() => {
      clientesFiltered.value = clientes.value;
    });
    return;
  }

  try {
    const results = await salidasService.searchClientes(val);
    update(() => {
      clientesFiltered.value = results;
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    update(() => {
      clientesFiltered.value = [];
    });
  }
};

const filterItems = async (val: string, update: (callback: () => void) => void) => {
  if (val.length < 3) {
    update(() => {
      itemsFiltered.value = items.value;
    });
    return;
  }

  try {
    const results = await salidasService.searchItems(val);
    update(() => {
      itemsFiltered.value = results;
    });
  } catch (error) {
    console.error('Error al buscar items:', error);
    update(() => {
      itemsFiltered.value = [];
    });
  }
};

const onItemChange = () => {
  if (itemForm.value.item) {
    const selectedItem = itemsFiltered.value.find(i => i.id === itemForm.value.item);
    if (selectedItem) {
      itemForm.value.psalida = selectedItem.precio_venta || selectedItem.precio_sin_iva;
      itemForm.value.por_iva = selectedItem.por_iva;
    }
  }
};

const agregarItem = () => {
  if (!itemForm.value.item) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un item'
    });
    return;
  }

  if (itemForm.value.cantidad <= 0) {
    $q.notify({
      type: 'warning',
      message: 'La cantidad debe ser mayor a 0'
    });
    return;
  }

  if (itemForm.value.psalida <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    });
    return;
  }

  const selectedItem = itemsFiltered.value.find(i => i.id === itemForm.value.item);
  if (!selectedItem) return;

  // Calcular cantidad ya agregada del mismo item en la tabla
  const cantidadYaAgregada = itemsTabla.value
    .filter(item => item.id === selectedItem.id)
    .reduce((sum, item) => sum + item.cantidad, 0);

  // Validar que hay suficiente inventario
  const inventarioDisponible = (selectedItem.inventario_actual || 0) - cantidadYaAgregada;

  if (itemForm.value.cantidad > inventarioDisponible) {
    $q.notify({
      type: 'negative',
      message: `Stock insuficiente. Disponible: ${inventarioDisponible} unidades (Inventario actual: ${selectedItem.inventario_actual || 0}, Ya agregado: ${cantidadYaAgregada})`
    });
    return;
  }

  const subtotal = (itemForm.value.psalida * (1 - itemForm.value.descuento / 100)) * itemForm.value.cantidad;

  itemsTabla.value.push({
    id: selectedItem.id,
    codigo: selectedItem.codigo,
    nombre: selectedItem.nombre,
    cantidad: itemForm.value.cantidad,
    psalida: itemForm.value.psalida,
    por_iva: itemForm.value.por_iva,
    descuento: itemForm.value.descuento,
    subtotal: subtotal
  });

  // Limpiar formulario
  itemForm.value = {
    item: null,
    cantidad: 1,
    psalida: 0,
    por_iva: 0,
    descuento: 0
  };

  $q.notify({
    type: 'positive',
    message: 'Item agregado'
  });
};

const eliminarItem = (index: number) => {
  itemsTabla.value.splice(index, 1);
};

const subtotal = computed(() => {
  return itemsTabla.value.reduce((sum, item) => sum + item.subtotal, 0);
});

const totalDescuento = computed(() => {
  return itemsTabla.value.reduce((sum, item) => {
    return sum + (item.psalida * item.cantidad * (item.descuento / 100));
  }, 0);
});

const totalIva = computed(() => {
  return itemsTabla.value.reduce((sum, item) => {
    return sum + (item.subtotal * (item.por_iva / 100));
  }, 0);
});

const total = computed(() => {
  return subtotal.value + totalIva.value;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2
  }).format(value || 0);
};

const handleSubmit = async () => {
  if (!form.value.cliente) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un cliente'
    });
    return;
  }

  if (!form.value.fecha) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione una fecha'
    });
    return;
  }

  if (!form.value.obs) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese las observaciones'
    });
    return;
  }

  if (itemsTabla.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe agregar al menos un item'
    });
    return;
  }

  try {
    loading.value = true;

    const salidaData: CreateSalidaDto = {
      cliente: form.value.cliente,
      plazo: form.value.plazo,
      fecha: form.value.fecha,
      subtotal: subtotal.value,
      descuento: totalDescuento.value,
      iva: totalIva.value,
      total: total.value,
      obs: form.value.obs,
      items: itemsTabla.value
    };

    const response = await salidasService.create(salidaData);

    if (response.ok) {
      $q.notify({
        type: 'positive',
        message: response.mensaje || 'Salida creada exitosamente'
      });
      router.push('/salidas');
    } else {
      throw new Error(response.mensaje || 'Error al crear la salida');
    }
  } catch (error: any) {
    console.error('Error al crear salida:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al crear la salida'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/salidas');
};

onMounted(() => {
  loadClientes();
  loadItems();
});
</script>

<template>
  <q-page class="new-salida-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="exit_to_app" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Nueva Salida</h1>
              <p class="page-subtitle">Registrar nueva salida de inventario</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <q-card flat class="form-card">
        <q-card-section>
          <div class="section-header">
            <q-icon name="info" size="24px" color="primary" />
            <span class="section-title">Información General</span>
          </div>
          <q-separator class="q-mb-md" />

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Cliente <span class="required">*</span></label>
              <q-select
                v-model="form.cliente"
                :options="clientesFiltered"
                option-value="codigo"
                :option-label="opt => `${opt.identificacion} - ${opt.nombre}`"
                emit-value
                map-options
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterClientes"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Escribe al menos 3 caracteres para buscar
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha <span class="required">*</span></label>
              <q-input
                v-model="form.fecha"
                type="date"
                outlined
                dense
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones <span class="required">*</span></label>
              <q-input
                v-model="form.obs"
                outlined
                dense
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Sección de Items -->
        <q-card-section>
          <div class="section-header">
            <q-icon name="inventory" size="24px" color="primary" />
            <span class="section-title">Items</span>
          </div>
          <q-separator class="q-mb-md" />

          <div class="items-form-grid">
            <div class="form-group item-select">
              <label class="form-label">Item</label>
              <q-select
                v-model="itemForm.item"
                :options="itemsFiltered"
                option-value="id"
                :option-label="opt => `${opt.codigo} - ${opt.nombre}`"
                emit-value
                map-options
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterItems"
                class="form-input"
                @update:model-value="onItemChange"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Escribe al menos 3 caracteres para buscar
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="form-group">
              <label class="form-label">% IVA</label>
              <q-input
                v-model.number="itemForm.por_iva"
                type="number"
                outlined
                dense
                class="form-input text-right"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Precio Salida</label>
              <q-input
                v-model.number="itemForm.psalida"
                type="number"
                outlined
                dense
                class="form-input text-right"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label class="form-label">% Desc</label>
              <q-input
                v-model.number="itemForm.descuento"
                type="number"
                outlined
                dense
                class="form-input text-right"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Cantidad</label>
              <q-input
                v-model.number="itemForm.cantidad"
                type="number"
                outlined
                dense
                class="form-input text-right"
                step="1"
                min="1"
              />
            </div>

            <div class="form-group">
              <label class="form-label">&nbsp;</label>
              <q-btn
                unelevated
                color="positive"
                icon="add"
                label="Agregar"
                class="full-width"
                @click="agregarItem"
              />
            </div>
          </div>

          <!-- Tabla de items -->
          <q-table
            :rows="itemsTabla"
            :columns="columns"
            row-key="codigo"
            flat
            class="items-table q-mt-md"
            :rows-per-page-options="[0]"
            hide-pagination
          >
            <template v-slot:body-cell-psalida="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.psalida) }}
              </q-td>
            </template>

            <template v-slot:body-cell-subtotal="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ formatCurrency(props.row.subtotal) }}</span>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="eliminarItem(props.rowIndex)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width text-center q-pa-md text-grey-6">
                No hay items agregados
              </div>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <!-- Totales -->
        <q-card-section class="totales-section">
          <div class="totales-grid">
            <div class="total-item">
              <label class="total-label">Subtotal</label>
              <div class="total-value">{{ formatCurrency(subtotal) }}</div>
            </div>

            <div class="total-item">
              <label class="total-label">Descuento</label>
              <div class="total-value">{{ formatCurrency(totalDescuento) }}</div>
            </div>

            <div class="total-item">
              <label class="total-label">IVA</label>
              <div class="total-value">{{ formatCurrency(totalIva) }}</div>
            </div>

            <div class="total-item total-final">
              <label class="total-label">Total</label>
              <div class="total-value text-primary text-weight-bold">{{ formatCurrency(total) }}</div>
            </div>

            <div class="total-actions">
              <q-btn
                outline
                color="grey-7"
                icon="close"
                label="Cancelar"
                @click="handleCancel"
                :disable="loading"
                class="action-btn cancel-btn"
              />
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="Guardar Salida"
                @click="handleSubmit"
                :loading="loading"
                class="action-btn save-btn"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.new-salida-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 16px;
}

.items-form-grid {
  display: grid;
  grid-template-columns: 2fr 0.8fr 1fr 0.8fr 0.8fr 1fr;
  gap: 12px;
  align-items: end;
}

.item-select {
  grid-column: span 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
}

.required {
  color: #e53e3e;
}

.form-input {
  height: 48px;
  border-radius: 12px;
}

.text-right :deep(input) {
  text-align: right;
}

.items-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;

  :deep(thead tr th) {
    background-color: #f7fafc;
    font-weight: 600;
    color: #2d3748;
    font-size: 13px;
  }

  :deep(tbody td) {
    font-size: 14px;
  }
}

.totales-section {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.totales-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.total-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.total-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  padding: 12px;
  background: white;
  border-radius: 8px;
  text-align: right;
}

.total-final .total-value {
  font-size: 22px;
  color: #1976d2;
}

.total-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  min-width: 140px;
  height: 52px;
  padding: 0 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 2fr 1fr;
  }
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .items-form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .item-select {
    grid-column: span 2;
  }

  .totales-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .total-actions {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .form-grid,
  .items-form-grid {
    grid-template-columns: 1fr;
  }

  .item-select {
    grid-column: span 1;
  }

  .totales-grid {
    grid-template-columns: 1fr;
  }

  .total-actions {
    grid-column: span 1;
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>

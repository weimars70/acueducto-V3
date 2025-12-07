<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { compraService } from '../services/api/compras.service';
import type { CreateCompraDto, ItemCompra, Proveedor, Item } from '../types/compra';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const proveedores = ref<Proveedor[]>([]);
const items = ref<Item[]>([]);
const itemsTabla = ref<ItemCompra[]>([]);

// Formulario principal
const form = ref({
  proveedor: null as number | null,
  factura: '',
  forma_pago: 1,
  plazo: 0,
  fecha: new Date().toISOString().split('T')[0]
});

// Formulario de items
const itemForm = ref({
  item: null as number | null,
  cantidad: 1,
  pcompra: 0,
  por_iva: 0,
  descuento: 0
});

const formasPago = [
  { value: 1, label: 'Efectivo' },
  { value: 2, label: 'Transferencia' },
  { value: 3, label: 'Crédito' }
];

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'nombre', label: 'Descripción', field: 'nombre', align: 'left' as const },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' as const },
  { name: 'pcompra', label: 'Precio', field: 'pcompra', align: 'right' as const },
  { name: 'por_iva', label: 'IVA%', field: 'por_iva', align: 'right' as const },
  { name: 'descuento', label: 'Desc%', field: 'descuento', align: 'right' as const },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const }
];

const loadProveedores = async () => {
  try {
    proveedores.value = await compraService.getProveedores();
  } catch (error) {
    console.error('Error al cargar proveedores:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar proveedores'
    });
  }
};

const loadItems = async () => {
  try {
    items.value = await compraService.getItems();
  } catch (error) {
    console.error('Error al cargar items:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar items'
    });
  }
};

const onItemChange = () => {
  if (itemForm.value.item) {
    const selectedItem = items.value.find(i => i.codigo === itemForm.value.item);
    if (selectedItem) {
      itemForm.value.pcompra = selectedItem.precio_sin_iva;
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

  if (itemForm.value.pcompra <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    });
    return;
  }

  const selectedItem = items.value.find(i => i.codigo === itemForm.value.item);
  if (!selectedItem) return;

  const subtotal = (itemForm.value.pcompra * (1 - itemForm.value.descuento / 100)) * itemForm.value.cantidad;

  itemsTabla.value.push({
    codigo: selectedItem.codigo,
    nombre: selectedItem.nombre,
    cantidad: itemForm.value.cantidad,
    pcompra: itemForm.value.pcompra,
    por_iva: itemForm.value.por_iva,
    descuento: itemForm.value.descuento,
    subtotal: subtotal
  });

  // Limpiar formulario
  itemForm.value = {
    item: null,
    cantidad: 1,
    pcompra: 0,
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
    return sum + (item.pcompra * item.cantidad * (item.descuento / 100));
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
  if (!form.value.proveedor) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un proveedor'
    });
    return;
  }

  if (!form.value.factura) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese el número de factura'
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

  if (itemsTabla.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe agregar al menos un item'
    });
    return;
  }

  try {
    loading.value = true;

    const compraData: CreateCompraDto = {
      proveedor: form.value.proveedor,
      factura: form.value.factura,
      forma_pago: form.value.forma_pago,
      plazo: form.value.plazo,
      fecha: form.value.fecha,
      subtotal: subtotal.value,
      descuento: totalDescuento.value,
      iva: totalIva.value,
      total: total.value,
      items: itemsTabla.value
    };

    const response = await compraService.create(compraData);

    if (response.ok) {
      $q.notify({
        type: 'positive',
        message: response.mensaje || 'Compra creada exitosamente'
      });
      router.push('/compras');
    } else {
      throw new Error(response.mensaje || 'Error al crear la compra');
    }
  } catch (error: any) {
    console.error('Error al crear compra:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al crear la compra'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/compras');
};

onMounted(() => {
  loadProveedores();
  loadItems();
});
</script>

<template>
  <q-page class="new-compra-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="shopping_cart" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Nueva Compra</h1>
              <p class="page-subtitle">Registrar nueva compra a proveedor</p>
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
              <label class="form-label">Proveedor <span class="required">*</span></label>
              <q-select
                v-model="form.proveedor"
                :options="proveedores"
                option-value="codigo"
                :option-label="opt => `${opt.identificacion} - ${opt.nombre}`"
                emit-value
                map-options
                outlined
                dense
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-select>
            </div>

            <div class="form-group">
              <label class="form-label">Factura <span class="required">*</span></label>
              <q-input
                v-model="form.factura"
                outlined
                dense
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="receipt" />
                </template>
              </q-input>
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
              <label class="form-label">Forma de Pago <span class="required">*</span></label>
              <q-select
                v-model="form.forma_pago"
                :options="formasPago"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="payment" />
                </template>
              </q-select>
            </div>

            <div class="form-group">
              <label class="form-label">Plazo (días)</label>
              <q-input
                v-model.number="form.plazo"
                type="number"
                outlined
                dense
                class="form-input"
                min="0"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Sección de Items -->
        <q-card-section>

          <div class="items-form-grid">
            <div class="form-group item-select">
              <label class="form-label">Item</label>
              <q-select
                v-model="itemForm.item"
                :options="items"
                option-value="codigo"
                :option-label="opt => `${opt.codigo} - ${opt.nombre}`"
                emit-value
                map-options
                outlined
                dense
                class="form-input"
                @update:model-value="onItemChange"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory" />
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
              <label class="form-label">Precio Compra</label>
              <q-input
                v-model.number="itemForm.pcompra"
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
            <template v-slot:body-cell-pcompra="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.pcompra) }}
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
                unelevated
                color="negative"
                icon="cancel"
                label="Cancelar"
                @click="handleCancel"
                :disable="loading"
              />
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="Guardar Compra"
                @click="handleSubmit"
                :loading="loading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.new-compra-page {
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
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

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
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

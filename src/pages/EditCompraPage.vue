<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { compraService } from '../services/api/compras.service';
import type { Compra } from '../types/compra';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const loading = ref(true);
const compra = ref<Compra | null>(null);

const columns = [
  { name: 'codigo', label: 'Código', field: 'item', align: 'left' as const },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' as const },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' as const },
  { name: 'iva', label: 'IVA%', field: 'iva', align: 'right' as const },
  { name: 'descuento', label: 'Desc%', field: 'descuento', align: 'right' as const },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' as const }
];

const loadCompra = async () => {
  try {
    loading.value = true;
    const codigo = parseInt(route.params.id as string);
    compra.value = await compraService.getCompra(codigo);
  } catch (error) {
    console.error('Error al cargar compra:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la compra'
    });
    router.push('/compras');
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO');
};

const handleBack = () => {
  router.push('/compras');
};

onMounted(() => {
  loadCompra();
});
</script>

<template>
  <q-page class="edit-compra-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="shopping_cart" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Ver Compra</h1>
              <p class="page-subtitle">Detalles de la compra</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="grey-7"
            icon="arrow_back"
            label="Volver"
            @click="handleBack"
          />
        </div>
      </div>

      <q-card v-if="!loading && compra" flat class="form-card">
        <q-card-section>
          <div class="section-header">
            <q-icon name="info" size="24px" color="primary" />
            <span class="section-title">Información General</span>
          </div>
          <q-separator class="q-mb-md" />

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Código</label>
              <div class="info-value">#{{ compra.codigo }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">Factura</label>
              <div class="info-value">{{ compra.factura }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">Proveedor</label>
              <div class="info-value">{{ compra.proveedorNombre || 'N/A' }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">Fecha</label>
              <div class="info-value">{{ formatDate(compra.fechahora) }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">Estado</label>
              <q-chip
                :color="compra.anulado ? 'negative' : 'positive'"
                text-color="white"
                size="sm"
              >
                {{ compra.anulado ? 'Anulado' : 'Activo' }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="compra.items && compra.items.length > 0">
          <div class="section-header">
            <q-icon name="list_alt" size="24px" color="primary" />
            <span class="section-title">Items</span>
          </div>
          <q-separator class="q-mb-md" />

          <q-table
            :rows="compra.items"
            :columns="columns"
            row-key="item"
            flat
            class="items-table"
            :rows-per-page-options="[0]"
            hide-pagination
          >
            <template v-slot:body-cell-precio="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.precio) }}
              </q-td>
            </template>

            <template v-slot:body-cell-subtotal="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ formatCurrency(props.row.subtotal) }}</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-section class="totales-section">
          <div class="totales-grid">
            <div class="total-item">
              <label class="total-label">Subtotal</label>
              <div class="total-value">{{ formatCurrency(compra.subtotal) }}</div>
            </div>

            <div class="total-item">
              <label class="total-label">Descuento</label>
              <div class="total-value">{{ formatCurrency(compra.descuento) }}</div>
            </div>

            <div class="total-item">
              <label class="total-label">IVA</label>
              <div class="total-value">{{ formatCurrency(compra.iva) }}</div>
            </div>

            <div class="total-item total-final">
              <label class="total-label">Total</label>
              <div class="total-value text-primary text-weight-bold">{{ formatCurrency(compra.total) }}</div>
            </div>

            <div class="total-item">
              <label class="total-label">Saldo</label>
              <div class="total-value" :class="compra.saldo && compra.saldo > 0 ? 'text-negative' : 'text-positive'">
                {{ formatCurrency(compra.saldo || 0) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-else class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.edit-compra-page {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>

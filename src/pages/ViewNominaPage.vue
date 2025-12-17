<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { nominasService } from '../services/api/nomina.service';
import type { Nomina, NominaDetalle } from '../types/nomina';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(true);
const nomina = ref<Nomina | null>(null);
const nominaId = computed(() => Number(route.params.id));

const loadNomina = async () => {
  try {
    loading.value = true;
    const data = await nominasService.getNomina(nominaId.value);
    nomina.value = data;
  } catch (error: any) {
    console.error('Error al cargar nómina:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la nómina'
    });
    router.push('/nominas');
  } finally {
    loading.value = false;
  }
};

const handleCalcular = async () => {
  if (!nomina.value) return;

  try {
    $q.loading.show({ message: 'Calculando nómina...' });
    const updated = await nominasService.calcularNomina(nomina.value.id);
    nomina.value = updated;
    $q.notify({
      type: 'positive',
      message: 'Nómina calculada exitosamente'
    });
  } catch (error: any) {
    console.error('Error al calcular nómina:', error);
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al calcular la nómina'
    });
  } finally {
    $q.loading.hide();
  }
};

const handleAprobar = async () => {
  if (!nomina.value) return;

  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de aprobar esta nómina?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const updated = await nominasService.aprobarNomina({ nominaId: nomina.value!.id });
      nomina.value = updated;
      $q.notify({
        type: 'positive',
        message: 'Nómina aprobada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al aprobar nómina:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al aprobar la nómina'
      });
    }
  });
};

const handlePagar = async () => {
  if (!nomina.value) return;

  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de marcar esta nómina como pagada?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const updated = await nominasService.marcarComoPagado(nomina.value!.id);
      nomina.value = updated;
      $q.notify({
        type: 'positive',
        message: 'Nómina marcada como pagada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al marcar nómina como pagada:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al marcar la nómina como pagada'
      });
    }
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO');
};

const devengados = computed(() => {
  if (!nomina.value?.detalles) return [];
  return nomina.value.detalles.filter(d => d.concepto?.tipo === 'DEVENGADO');
});

const deducciones = computed(() => {
  if (!nomina.value?.detalles) return [];
  return nomina.value.detalles.filter(d => d.concepto?.tipo === 'DEDUCCION');
});

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'BORRADOR': return 'grey';
    case 'APROBADO': return 'warning';
    case 'PAGADO': return 'positive';
    default: return 'grey';
  }
};

onMounted(() => {
  loadNomina();
});
</script>

<template>
  <q-page class="form-page">
    <div class="form-container">
      <!-- Header -->
      <div class="form-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="grey-7"
          @click="router.push('/nominas')"
          class="back-btn"
        >
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
        <div class="header-content">
          <q-icon name="payments" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Detalle de Nómina</h1>
            <p class="form-subtitle">Información completa de la nómina</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card flat class="form-card" v-if="loading">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-grey-7 q-mt-md">Cargando nómina...</div>
        </q-card-section>
      </q-card>

      <!-- Nomina Detail -->
      <div v-else-if="nomina">
        <!-- Información General -->
        <q-card flat class="form-card q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6 text-weight-bold">
                  {{ nomina.empleado?.nombre_completo || nomina.empleado_nombre || 'Empleado' }}
                </div>
                <div class="text-caption text-grey-7">
                  Cédula: {{ nomina.empleado?.cedula || 'N/A' }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getEstadoColor(nomina.estado)"
                  text-color="white"
                  size="md"
                >
                  {{ nomina.estado }}
                </q-chip>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7">Período</div>
                <div class="text-body1 text-weight-medium">
                  {{ nomina.periodo?.nombre || nomina.periodo_nombre || 'N/A' }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-caption text-grey-7">Días Pagados</div>
                <div class="text-body1 text-weight-medium">{{ nomina.dias_pagados }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-caption text-grey-7">Valor Hora</div>
                <div class="text-body1 text-weight-medium">{{ formatCurrency(nomina.valor_hora) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Totales -->
        <q-card flat class="form-card q-mb-md" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <q-card-section class="text-white">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="text-caption" style="opacity: 0.9">Total Devengado</div>
                <div class="text-h6 text-weight-bold">{{ formatCurrency(nomina.total_devengado) }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-caption" style="opacity: 0.9">Total Deducciones</div>
                <div class="text-h6 text-weight-bold">{{ formatCurrency(nomina.total_deducciones) }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-caption" style="opacity: 0.9">Neto a Pagar</div>
                <div class="text-h5 text-weight-bold">{{ formatCurrency(nomina.neto_pagar) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Devengados -->
        <q-card flat class="form-card q-mb-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">
              <q-icon name="trending_up" color="green-7" class="q-mr-sm" />
              Devengados
            </div>
            <q-table
              flat
              :rows="devengados"
              :columns="[
                { name: 'concepto', label: 'Concepto', field: 'concepto', align: 'left' },
                { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
                { name: 'valor_unitario', label: 'Valor Unitario', field: 'valor_unitario', align: 'right' },
                { name: 'valor_total', label: 'Total', field: 'valor_total', align: 'right' }
              ]"
              :hide-pagination="true"
              :rows-per-page-options="[0]"
            >
              <template v-slot:body-cell-concepto="props">
                <q-td :props="props">
                  {{ props.row.concepto?.nombre || 'N/A' }}
                </q-td>
              </template>
              <template v-slot:body-cell-valor_unitario="props">
                <q-td :props="props">{{ formatCurrency(props.row.valor_unitario) }}</q-td>
              </template>
              <template v-slot:body-cell-valor_total="props">
                <q-td :props="props" class="text-weight-medium">
                  {{ formatCurrency(props.row.valor_total) }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Deducciones -->
        <q-card flat class="form-card q-mb-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">
              <q-icon name="trending_down" color="red-7" class="q-mr-sm" />
              Deducciones
            </div>
            <q-table
              flat
              :rows="deducciones"
              :columns="[
                { name: 'concepto', label: 'Concepto', field: 'concepto', align: 'left' },
                { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
                { name: 'valor_unitario', label: 'Valor Unitario', field: 'valor_unitario', align: 'right' },
                { name: 'valor_total', label: 'Total', field: 'valor_total', align: 'right' }
              ]"
              :hide-pagination="true"
              :rows-per-page-options="[0]"
            >
              <template v-slot:body-cell-concepto="props">
                <q-td :props="props">
                  {{ props.row.concepto?.nombre || 'N/A' }}
                </q-td>
              </template>
              <template v-slot:body-cell-valor_unitario="props">
                <q-td :props="props">{{ formatCurrency(props.row.valor_unitario) }}</q-td>
              </template>
              <template v-slot:body-cell-valor_total="props">
                <q-td :props="props" class="text-weight-medium text-red-7">
                  {{ formatCurrency(props.row.valor_total) }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Actions -->
        <q-card flat class="form-card">
          <q-card-section>
            <div class="row q-gutter-sm justify-end">
              <q-btn
                v-if="nomina.estado === 'BORRADOR'"
                outline
                color="green-7"
                icon="calculate"
                label="Calcular"
                @click="handleCalcular"
                class="q-px-lg"
              />
              <q-btn
                v-if="nomina.estado === 'BORRADOR'"
                outline
                color="orange-7"
                icon="check"
                label="Aprobar"
                @click="handleAprobar"
                class="q-px-lg"
              />
              <q-btn
                v-if="nomina.estado === 'APROBADO'"
                unelevated
                color="positive"
                icon="payments"
                label="Marcar como Pagado"
                @click="handlePagar"
                class="q-px-lg"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.form-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  position: relative;
  margin-bottom: 24px;
}

.back-btn {
  position: absolute;
  top: 0;
  left: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 56px;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.form-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
</style>


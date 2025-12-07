<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { diferidosService } from '../services/api/diferidos.service';
import type { Diferido } from '../types/diferido';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const diferidos = ref<Diferido[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left', headerStyle: 'width: 60px' },
  { name: 'contrato', label: 'Contrato', field: (row: Diferido) => row.contrato ? `${row.contrato.nombre} (${row.contratoId})` : row.contratoId, sortable: true, align: 'left' },
  { name: 'concepto', label: 'Concepto', field: (row: Diferido) => row.concepto?.nombre || row.conceptoDiferidoId, sortable: true, align: 'left' },
  { name: 'monto', label: 'Monto Original', field: 'montoOriginal', sortable: true, align: 'right', format: (val: number) => `$ ${val.toLocaleString()}` },
  { name: 'saldo', label: 'Saldo', field: 'saldo', sortable: true, align: 'right', format: (val: number) => `$ ${val ? Number(val).toLocaleString() : '0'}` },
  { name: 'valorCuota', label: 'Valor Cuota', field: 'valorCuota', sortable: true, align: 'right', format: (val: number) => `$ ${val ? val.toLocaleString() : '0'}` },
  { name: 'cuotas', label: 'Cuotas', field: 'cuotasPendientes', sortable: true, align: 'center' },
  { name: 'progreso', label: 'Progreso', field: 'progreso', align: 'left', style: 'width: 150px' },
  { name: 'estado', label: 'Estado', field: 'estado', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
];

const loadDiferidos = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId;
    diferidos.value = await diferidosService.getAll(empresaId);
  } catch (error) {
    console.error('Error loading diferidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar diferidos'
    });
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: Diferido) => {
  router.push(`/diferidos/editar/${row.id}`);
};

const handleDelete = (row: Diferido) => {
  $q.dialog({
    title: 'Confirmar Anulación',
    message: `¿Está seguro de anular el diferido #${row.id}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Sí, Anular', color: 'negative' },
    cancel: { label: 'Cancelar', flat: true }
  }).onOk(async () => {
    try {
      await diferidosService.delete(row.id);
      $q.notify({
        type: 'positive',
        message: 'Diferido anulado exitosamente'
      });
      loadDiferidos();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al anular el diferido'
      });
    }
  });
};

onMounted(() => {
  loadDiferidos();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
            <q-icon name="schedule" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Gestión de Diferidos</div>
          <div class="text-caption text-grey-7">Administre los acuerdos de pago y financiaciones</div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Diferido"
        to="/diferidos/nuevo"
        unelevated
        class="q-px-lg q-py-xs shadow-2"
        rounded
        no-caps
      />
    </div>

    <q-card class="shadow-2 rounded-xl bg-white">
      <q-table
        :rows="diferidos"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="filter"
        flat
        class="no-border"
        content-class="text-grey-8"
        table-header-class="text-weight-bold text-grey-7 bg-grey-1 text-uppercase"
      >
        <template v-slot:top>
           <div class="row full-width items-center q-py-sm">
              <div class="text-h6 text-weight-medium text-primary">Listado de Acuerdos</div>
              <q-space />
              <q-input 
                outlined 
                dense 
                debounce="300" 
                v-model="filter" 
                placeholder="Buscar contrato, concepto..."
                class="search-input bg-grey-1"
                rounded
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="grey-5" />
                </template>
              </q-input>
           </div>
        </template>

        <template v-slot:body-cell-contrato="props">
            <q-td :props="props">
                <div class="row items-center">
                    <q-avatar size="sm" color="blue-1" text-color="blue-9" icon="home" class="q-mr-sm" />
                    <div>{{ props.value }}</div>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-progreso="props">
             <q-td :props="props">
                 <q-linear-progress 
                    size="6px" 
                    :value="(props.row.numeroCuotas - props.row.cuotasPendientes) / props.row.numeroCuotas" 
                    color="primary" 
                    track-color="grey-3"
                    rounded
                    class="q-mt-sm"
                 >
                 </q-linear-progress>
                 <div class="text-caption text-grey-6 text-right q-mt-xs">
                     {{ props.row.numeroCuotas - props.row.cuotasPendientes }} / {{ props.row.numeroCuotas }}
                 </div>
             </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estado === 'PENDIENTE' ? 'amber-2' : (props.row.estado === 'ANULADO' ? 'red-1' : 'green-1')"
              :text-color="props.row.estado === 'PENDIENTE' ? 'amber-9' : (props.row.estado === 'ANULADO' ? 'red-9' : 'green-9')"
              class="q-py-xs q-px-sm text-weight-bold"
              rounded
            >
              {{ props.row.estado }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row justify-end">
                <q-btn flat round color="grey-7" icon="edit" size="md" @click="handleEdit(props.row)" class="hover-scale">
                  <q-tooltip class="bg-primary">Editar</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete_outline" size="md" @click="handleDelete(props.row)" class="hover-scale">
                  <q-tooltip class="bg-negative">Anular</q-tooltip>
                </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<style scoped>
.rounded-xl {
  border-radius: 20px;
}
.rounded-borders {
    border-radius: 12px;
}
.search-input {
  width: 280px;
}
.hover-scale {
    transition: transform 0.2s;
}
.hover-scale:hover {
    transform: scale(1.1);
}
:deep(.q-table__card) {
    box-shadow: none;
}
:deep(.q-table th) {
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}
</style>

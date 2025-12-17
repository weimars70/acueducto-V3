<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { parametroNominaService } from '../services/api/parametro-nomina.service';
import type { ParametroNomina } from '../types/parametro-nomina';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const parametros = ref<ParametroNomina[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
const availableYears = ref<number[]>([]);
const selectedYear = ref<number | null>(null);
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

// Dialog duplicar año
const showDuplicateDialog = ref(false);
const sourceYear = ref<number | null>(null);
const targetYear = ref<number | null>(null);

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const, sortable: true },
  { name: 'anio', label: 'Año', field: 'anio', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const filteredParametros = computed(() => {
  if (!filter.value) return parametros.value;
  const searchTerm = filter.value.toLowerCase();
  return parametros.value.filter(p =>
    p.codigo?.toLowerCase().includes(searchTerm) ||
    p.nombre?.toLowerCase().includes(searchTerm) ||
    p.descripcion?.toLowerCase().includes(searchTerm)
  );
});

const loadYears = async () => {
  try {
    const years = await parametroNominaService.getYears();
    availableYears.value = years;
    if (years.length > 0 && !selectedYear.value) {
      selectedYear.value = years[0]; // Seleccionar el año más reciente por defecto
    }
  } catch (error) {
    console.error('Error al cargar años:', error);
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const response = await parametroNominaService.getParametros({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      anio: selectedYear.value || undefined,
    });

    if (response && response.data) {
      parametros.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      parametros.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar parámetros:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los parámetros de nómina'
    });
    parametros.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props: any) => {
  const { page, rowsPerPage } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  loadData();
};

const handleYearChange = () => {
  pagination.value.page = 1;
  loadData();
};

const handleEdit = (parametro: ParametroNomina) => {
  router.push(`/parametros-nomina/edit/${parametro.id}`);
};

const handleDelete = async (parametro: ParametroNomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el parámetro ${parametro.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await parametroNominaService.delete(parametro.id);
      $q.notify({
        type: 'positive',
        message: 'Parámetro eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar parámetro:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el parámetro'
      });
    }
  });
};

const openDuplicateDialog = () => {
  sourceYear.value = selectedYear.value;
  targetYear.value = null;
  showDuplicateDialog.value = true;
};

const handleDuplicateYear = async () => {
  if (!sourceYear.value || !targetYear.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar tanto el año origen como el año destino'
    });
    return;
  }

  if (sourceYear.value === targetYear.value) {
    $q.notify({
      type: 'warning',
      message: 'El año origen y destino deben ser diferentes'
    });
    return;
  }

  try {
    const result = await parametroNominaService.duplicateYear({
      sourceYear: sourceYear.value,
      targetYear: targetYear.value,
    });

    $q.notify({
      type: 'positive',
      message: result.message
    });

    showDuplicateDialog.value = false;
    await loadYears();
    selectedYear.value = targetYear.value;
    loadData();
  } catch (error: any) {
    console.error('Error al duplicar año:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al duplicar el año'
    });
  }
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'descripcion', label: 'Descripción' },
      { field: 'valor', label: 'Valor' },
      { field: 'anio', label: 'Año' }
    ];

    exportToExcel(filteredParametros.value, exportColumns, `parametros-nomina-${selectedYear.value || 'todos'}`);
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'valor', label: 'Valor' },
      { field: 'anio', label: 'Año' }
    ];

    exportToPDF(filteredParametros.value, exportColumns, `parametros-nomina-${selectedYear.value || 'todos'}`, 'Parámetros de Nómina');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

onMounted(async () => {
  await loadYears();
  loadData();
});
</script>

<template>
  <q-page padding>
    <!-- Header Card -->
    <q-card flat class="q-mb-md shadow-1" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <q-card-section class="text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="settings" size="32px" class="q-mr-sm" />
              Parámetros de Nómina
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Configuración de valores y porcentajes
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              rounded
              icon="content_copy"
              label="Duplicar Año"
              color="white"
              text-color="purple-9"
              size="md"
              class="q-px-lg q-mr-sm shadow-3"
              @click="openDuplicateDialog"
              style="font-weight: 600;"
              :disable="!availableYears.length"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters and Actions Card -->
    <q-card flat class="q-mb-md shadow-1">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="selectedYear"
              :options="availableYears"
              outlined
              dense
              label="Filtrar por Año"
              @update:model-value="handleYearChange"
              style="border-radius: 12px;"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" color="purple-7" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              placeholder="Buscar por código, nombre o descripción..."
              style="border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="purple-7" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                outline
                rounded
                color="green-7"
                icon="file_download"
                label="Excel"
                @click="handleExportExcel"
                :disable="!parametros.length"
                class="q-px-md"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="picture_as_pdf"
                label="PDF"
                @click="handleExportPDF"
                :disable="!parametros.length"
                class="q-px-md"
              />
              <q-btn-toggle
                v-model="viewMode"
                rounded
                outline
                toggle-color="purple-7"
                color="grey-7"
                :options="[
                  {label: 'Tabla', value: 'table', icon: 'view_list'},
                  {label: 'Tarjetas', value: 'grid', icon: 'view_module'}
                ]"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table View -->
    <q-card flat class="shadow-1" v-if="viewMode === 'table'">
      <q-table
        flat
        :rows="filteredParametros"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[12, 24, 48]"
        binary-state-sort
      >
        <template v-slot:body-cell-valor="props">
          <q-td :props="props">
            <span class="text-weight-medium">
              {{ formatCurrency(props.row.valor) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-anio="props">
          <q-td :props="props">
            <q-chip
              color="purple-6"
              text-color="white"
              size="sm"
              icon="calendar_today"
            >
              {{ props.row.anio }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="blue-7"
              size="sm"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="red-7"
              size="sm"
              @click="handleDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-grey-7">
              No hay parámetros de nómina registrados{{ selectedYear ? ` para el año ${selectedYear}` : '' }}
            </span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Grid View -->
    <div v-else class="row q-col-gutter-md">
      <div v-if="loading" class="col-12">
        <div class="row q-col-gutter-md">
          <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="200px" />
          </div>
        </div>
      </div>
      <div v-else-if="!filteredParametros.length" class="col-12">
        <q-card flat class="text-center q-pa-xl">
          <q-icon name="info" size="4em" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            No hay parámetros de nómina registrados{{ selectedYear ? ` para el año ${selectedYear}` : '' }}
          </div>
        </q-card>
      </div>
      <div
        v-else
        v-for="parametro in filteredParametros"
        :key="parametro.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat class="shadow-1 q-hoverable" style="border-radius: 16px; height: 100%;">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-h6 text-weight-bold text-grey-9">
                  {{ parametro.nombre }}
                </div>
                <div class="text-caption text-grey-6">
                  Código: {{ parametro.codigo }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  color="purple-6"
                  text-color="white"
                  size="sm"
                  icon="calendar_today"
                >
                  {{ parametro.anio }}
                </q-chip>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body2 q-mb-xs">
              <q-icon name="description" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Descripción:</span>
              <div class="text-body2 q-ml-md q-mt-xs">
                {{ parametro.descripcion || '-' }}
              </div>
            </div>

            <div class="text-h6 text-weight-bold text-purple-8 q-my-md text-center">
              {{ formatCurrency(parametro.valor) }}
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                outline
                rounded
                color="blue-7"
                icon="edit"
                label="Editar"
                size="sm"
                class="col"
                @click="handleEdit(parametro)"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="delete"
                label="Eliminar"
                size="sm"
                class="col"
                @click="handleDelete(parametro)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para duplicar año -->
    <q-dialog v-model="showDuplicateDialog" persistent>
      <q-card style="min-width: 400px; border-radius: 16px;">
        <q-card-section class="bg-purple-7 text-white">
          <div class="text-h6 text-weight-bold">
            <q-icon name="content_copy" size="24px" class="q-mr-sm" />
            Duplicar Parámetros de Año
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-7 q-mb-md">
            Esta acción copiará todos los parámetros del año origen al año destino.
            El año destino no debe tener parámetros existentes.
          </div>

          <q-select
            v-model="sourceYear"
            :options="availableYears"
            outlined
            label="Año Origen"
            class="q-mb-md"
            style="border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="source" color="purple-7" />
            </template>
          </q-select>

          <q-input
            v-model.number="targetYear"
            type="number"
            outlined
            label="Año Destino"
            style="border-radius: 12px;"
            :rules="[
              val => !!val || 'El año destino es requerido',
              val => val > 2000 && val < 2100 || 'Ingrese un año válido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="flag" color="purple-7" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            outline
            rounded
            label="Cancelar"
            color="grey-7"
            v-close-popup
            class="q-px-lg"
          />
          <q-btn
            rounded
            label="Duplicar"
            color="purple-7"
            @click="handleDuplicateYear"
            class="q-px-lg"
            icon="content_copy"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

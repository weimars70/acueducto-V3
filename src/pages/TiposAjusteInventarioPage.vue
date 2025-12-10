<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
            <div class="row items-center">
              <div class="col">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <q-icon name="settings" size="32px" color="primary" />
                  <h5 style="margin: 0; font-weight: 600; color: #2c3e50;">Tipos de Ajuste de Inventario</h5>
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  label="Nuevo Tipo"
                  icon="add"
                  color="primary"
                  unelevated
                  @click="openCreateDialog"
                  style="border-radius: 12px; padding: 10px 24px; height: 48px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
        <q-table
          :rows="tipos"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          flat
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.sumaUnidades"
                color="positive"
                label="Suma Unidades"
                style="padding: 6px 12px; font-size: 12px;"
              />
              <q-badge
                v-else-if="props.row.restaUnidades"
                color="negative"
                label="Resta Unidades"
                style="padding: 6px 12px; font-size: 12px;"
              />
              <q-badge
                v-else
                color="primary"
                label="Valor Unidades"
                style="padding: 6px 12px; font-size: 12px;"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="toggleActivo(props.row)"
                color="positive"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialog Crear/Editar -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px; border-radius: 16px;">
        <q-card-section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0;">
          <div class="text-h6">{{ isEditing ? 'Editar Tipo de Ajuste' : 'Nuevo Tipo de Ajuste' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveForm">
            <!-- Nombre -->
            <div class="q-mb-md">
              <div style="font-weight: 600; margin-bottom: 8px;">Nombre <span style="color: #ef4444;">*</span></div>
              <q-input
                v-model="formData.nombre"
                outlined
                dense
                placeholder="Ej: Devolución de Cliente"
                :rules="[val => !!val || 'El nombre es requerido']"
                style="border-radius: 12px;"
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-input>
            </div>

            <!-- Tipo de Operación -->
            <div class="q-mb-md">
              <div style="font-weight: 600; margin-bottom: 8px;">Tipo de Operación <span style="color: #ef4444;">*</span></div>
              <q-option-group
                v-model="tipoOperacion"
                :options="tipoOperacionOptions"
                color="primary"
                @update:model-value="updateTipoOperacion"
              />
            </div>

            <!-- Activo -->
            <div class="q-mb-md">
              <q-checkbox
                v-model="formData.activo"
                label="Activo"
                color="positive"
              />
            </div>

            <!-- Botones -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-6">
                <q-btn
                  label="Cancelar"
                  outline
                  color="grey-7"
                  @click="showDialog = false"
                  class="full-width"
                  unelevated
                  style="border-radius: 12px; height: 48px;"
                />
              </div>
              <div class="col-6">
                <q-btn
                  :label="isEditing ? 'Actualizar' : 'Crear'"
                  type="submit"
                  color="primary"
                  :loading="saving"
                  class="full-width"
                  unelevated
                  style="border-radius: 12px; height: 48px;"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { tiposAjusteInventarioService, type TipoAjusteInventario } from '../services/api/tipos-ajuste-inventario.service';

const $q = useQuasar();

const tipos = ref<TipoAjusteInventario[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const isEditing = ref(false);
const saving = ref(false);

const formData = ref({
  nombre: '',
  sumaUnidades: false,
  restaUnidades: false,
  valorUnidades: false,
  activo: true
});

const tipoOperacion = ref('suma');
const tipoOperacionOptions = [
  { label: 'Suma Unidades (Entrada)', value: 'suma' },
  { label: 'Resta Unidades (Salida)', value: 'resta' },
  { label: 'Valor Unidades (Establece cantidad exacta)', value: 'valor' }
];

const editingCodigo = ref<number | null>(null);

const columns = [
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'tipo',
    label: 'Tipo de Operación',
    field: 'tipo',
    align: 'center' as const
  },
  {
    name: 'activo',
    label: 'Activo',
    field: 'activo',
    align: 'center' as const
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center' as const
  }
];

const loadTipos = async () => {
  loading.value = true;
  try {
    tipos.value = await tiposAjusteInventarioService.getAll();
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar tipos de ajuste',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  editingCodigo.value = null;
  formData.value = {
    nombre: '',
    sumaUnidades: true,
    restaUnidades: false,
    valorUnidades: false,
    activo: true
  };
  tipoOperacion.value = 'suma';
  showDialog.value = true;
};

const openEditDialog = (tipo: TipoAjusteInventario) => {
  isEditing.value = true;
  editingCodigo.value = tipo.codigo;
  formData.value = {
    nombre: tipo.nombre,
    sumaUnidades: tipo.sumaUnidades,
    restaUnidades: tipo.restaUnidades,
    valorUnidades: tipo.valorUnidades,
    activo: tipo.activo
  };

  if (tipo.sumaUnidades) {
    tipoOperacion.value = 'suma';
  } else if (tipo.restaUnidades) {
    tipoOperacion.value = 'resta';
  } else {
    tipoOperacion.value = 'valor';
  }

  showDialog.value = true;
};

const updateTipoOperacion = (value: string) => {
  formData.value.sumaUnidades = value === 'suma';
  formData.value.restaUnidades = value === 'resta';
  formData.value.valorUnidades = value === 'valor';
};

const saveForm = async () => {
  saving.value = true;
  try {
    if (isEditing.value && editingCodigo.value) {
      await tiposAjusteInventarioService.update(editingCodigo.value, formData.value);
      $q.notify({
        type: 'positive',
        message: 'Tipo de ajuste actualizado correctamente',
        position: 'top'
      });
    } else {
      await tiposAjusteInventarioService.create(formData.value);
      $q.notify({
        type: 'positive',
        message: 'Tipo de ajuste creado correctamente',
        position: 'top'
      });
    }
    showDialog.value = false;
    await loadTipos();
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar',
      position: 'top'
    });
  } finally {
    saving.value = false;
  }
};

const toggleActivo = async (tipo: TipoAjusteInventario) => {
  try {
    await tiposAjusteInventarioService.update(tipo.codigo, { activo: !tipo.activo });
    $q.notify({
      type: 'positive',
      message: `Tipo ${!tipo.activo ? 'activado' : 'desactivado'} correctamente`,
      position: 'top'
    });
    await loadTipos();
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al actualizar estado',
      position: 'top'
    });
  }
};

const confirmDelete = (tipo: TipoAjusteInventario) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el tipo "${tipo.nombre}"?`,
    cancel: {
      label: 'Cancelar',
      flat: true
    },
    ok: {
      label: 'Eliminar',
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await tiposAjusteInventarioService.delete(tipo.codigo);
      $q.notify({
        type: 'positive',
        message: 'Tipo de ajuste eliminado correctamente',
        position: 'top'
      });
      await loadTipos();
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar',
        position: 'top'
      });
    }
  });
};

onMounted(() => {
  loadTipos();
});
</script>

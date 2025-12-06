<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { terceroService } from '../services/api/tercero.service';
import type { TerceroContacto, CreateContactoDto, UpdateContactoDto } from '../types/tercero';

const props = defineProps<{
  terceroCodigo: number;
}>();

const $q = useQuasar();
const contactos = ref<TerceroContacto[]>([]);
const tiposContacto = ref<{ label: string; value: number }[]>([]);
const loading = ref(false);
const editMode = ref(false);
const formData = ref<Partial<TerceroContacto>>({
  tipoContacto: undefined,
  nombre: '',
  telefono: '',
  direccion: '',
  correo: ''
});

// Columnas de la tabla
const columns = [
  { name: 'codigo', label: 'ID', field: 'codigo', align: 'center' as const, sortable: true, style: 'width: 60px' },
  { name: 'tipoContactoNombre', label: 'Tipo', field: 'tipoContactoNombre', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' as const },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' as const },
  { name: 'actions', label: 'Acción', field: 'actions', align: 'center' as const }
];

const loadContactos = async () => {
  if (!props.terceroCodigo) return;

  try {
    loading.value = true;
    contactos.value = await terceroService.getContactosByTercero(props.terceroCodigo);
    console.log('Contactos cargados:', contactos.value);
    if (contactos.value.length > 0) {
      console.log('Primer contacto (ejemplo):', contactos.value[0]);
      console.log('Campos disponibles:', Object.keys(contactos.value[0]));
    }
  } catch (error) {
    console.error('Error al cargar contactos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los contactos'
    });
  } finally {
    loading.value = false;
  }
};

const loadTiposContacto = async () => {
  try {
    const tipos = await terceroService.getTiposContacto();
    tiposContacto.value = tipos.map(t => ({ label: t.nombre, value: t.codigo }));
  } catch (error) {
    console.error('Error al cargar tipos de contacto:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar tipos de contacto'
    });
  }
};

const resetForm = () => {
  formData.value = {
    tipoContacto: undefined,
    nombre: '',
    telefono: '',
    direccion: '',
    correo: ''
  };
  editMode.value = false;
};

const handleEdit = (contacto: TerceroContacto) => {
  console.log('Editando contacto:', contacto);
  formData.value = { ...contacto };
  console.log('FormData después de copiar:', formData.value);
  console.log('Codigo copiado:', formData.value.codigo);
  editMode.value = true;
  // Scroll al formulario
  const formElement = document.querySelector('.contactos-form');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleCancelEdit = () => {
  resetForm();
};

const handleDelete = (contacto: TerceroContacto) => {
  console.log('Intentando eliminar contacto:', contacto);
  console.log('Codigo del contacto:', contacto.codigo);
  console.log('Tipo de codigo:', typeof contacto.codigo);

  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el contacto ${contacto.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      console.log('Eliminando contacto con codigo:', contacto.codigo);
      await terceroService.deleteContacto(contacto.codigo);
      $q.notify({
        type: 'positive',
        message: 'Contacto eliminado exitosamente'
      });
      loadContactos();
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el contacto'
      });
    }
  });
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    console.log('=== SUBMIT ===');
    console.log('editMode:', editMode.value);
    console.log('formData.codigo:', formData.value.codigo);
    console.log('Condición (editMode && codigo):', editMode.value && formData.value.codigo);

    if (editMode.value && formData.value.codigo) {
      // Actualizar
      console.log('ACTUALIZANDO contacto con codigo:', formData.value.codigo);
      const updateData: UpdateContactoDto = {
        tipoContacto: formData.value.tipoContacto,
        nombre: formData.value.nombre,
        telefono: formData.value.telefono,
        direccion: formData.value.direccion,
        correo: formData.value.correo
      };
      await terceroService.updateContacto(formData.value.codigo, updateData);
      $q.notify({
        type: 'positive',
        message: 'Contacto actualizado exitosamente'
      });
    } else {
      // Crear
      console.log('CREANDO nuevo contacto');
      const createData: CreateContactoDto = {
        terceroCodigo: props.terceroCodigo,
        tipoContacto: formData.value.tipoContacto,
        nombre: formData.value.nombre,
        telefono: formData.value.telefono,
        direccion: formData.value.direccion,
        correo: formData.value.correo
      };
      await terceroService.createContacto(props.terceroCodigo, createData);
      $q.notify({
        type: 'positive',
        message: 'Contacto creado exitosamente'
      });
    }

    resetForm();
    loadContactos();
  } catch (error: any) {
    console.error('Error al guardar contacto:', error);
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al guardar el contacto'
    });
  } finally {
    loading.value = false;
  }
};

// Cargar datos cuando se monta el componente
onMounted(() => {
  loadTiposContacto();
  if (props.terceroCodigo) {
    loadContactos();
  }
});

// Recargar cuando cambia el terceroCodigo
watch(() => props.terceroCodigo, (newValue) => {
  if (newValue) {
    loadContactos();
  }
});
</script>

<template>
  <div class="contactos-section">
    <div class="section-header">
      <q-icon name="contacts" size="20px" color="primary" />
      <h3 class="section-title">Contactos del Tercero</h3>
    </div>

    <!-- Formulario inline - UNA SOLA FILA -->
    <div class="form-inline">
      <div class="inline-field">
        <label class="inline-label">Tipo</label>
        <q-select
          v-model="formData.tipoContacto"
          :options="tiposContacto"
          emit-value
          map-options
          outlined
          dense
          placeholder="Tipo Contacto"
          class="inline-input"
          style="width: 140px"
        />
      </div>

      <div class="inline-field">
        <label class="inline-label">Nombre <span class="required">*</span></label>
        <q-input
          v-model="formData.nombre"
          placeholder="Ej: Juan Pérez"
          outlined
          dense
          class="inline-input"
          style="width: 160px"
        />
      </div>

      <div class="inline-field">
        <label class="inline-label">Teléfono <span class="required">*</span></label>
        <q-input
          v-model="formData.telefono"
          placeholder="300 123 4567"
          outlined
          dense
          class="inline-input"
          style="width: 120px"
        />
      </div>

      <div class="inline-field">
        <label class="inline-label">Dirección</label>
        <q-input
          v-model="formData.direccion"
          placeholder="Dirección"
          outlined
          dense
          class="inline-input"
          style="flex: 1; min-width: 150px"
        />
      </div>

      <div class="inline-field">
        <label class="inline-label">Correo</label>
        <q-input
          v-model="formData.correo"
          type="email"
          placeholder="correo@ejemplo.com"
          outlined
          dense
          class="inline-input"
          style="width: 160px"
        />
      </div>

      <q-btn
        unelevated
        :label="editMode ? 'Actualizar' : 'Agregar'"
        :color="editMode ? 'primary' : 'positive'"
        @click="handleSubmit"
        :loading="loading"
        size="sm"
        dense
        :icon="editMode ? 'save' : 'add'"
        class="action-btn-green"
        style="width: 110px"
      />

      <q-btn
        v-if="editMode"
        outline
        label="Cancelar"
        color="grey-7"
        @click="handleCancelEdit"
        size="sm"
        dense
        icon="close"
        style="width: 100px"
      />
    </div>

    <q-card flat class="contactos-card">
      <q-table
        :rows="contactos"
        :columns="columns"
        :loading="loading"
        row-key="codigo"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
        class="contactos-table"
      >
        <!-- Acciones -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="handleEdit(props.row)"
                size="sm"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="handleDelete(props.row)"
                size="sm"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Sin datos -->
        <template v-slot:no-data>
          <div class="no-data">
            <q-icon name="contacts_outline" size="40px" color="grey-5" />
            <p class="no-data-text">No hay contactos registrados</p>
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.contactos-section {
  margin-top: 12px;
  border-top: 2px solid #1976d2;
  padding-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px 0;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
}

.form-inline {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.inline-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inline-label {
  font-size: 10px;
  font-weight: 600;
  color: #4a5568;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.required {
  color: #e53e3e;
  font-weight: 700;
}

.inline-input {
  :deep(.q-field__control) {
    border-radius: 4px;
    height: 32px;
    min-height: 32px;
    background: white;

    &:before {
      border-color: #d1d5db;
    }

    &:hover:before {
      border-color: #9ca3af;
    }
  }

  :deep(.q-field__control--focused) {
    background: white;

    &:before {
      border-color: #1976d2 !important;
      border-width: 1px !important;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-size: 12px;
    color: #374151;
    padding: 0 8px;
  }

  :deep(.q-field__prepend) {
    padding-right: 4px;
  }
}

.action-btn-green {
  font-size: 12px;
  font-weight: 500;
}

.contactos-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.contactos-table {
  :deep(thead tr th) {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 11px;
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  :deep(tbody tr) {
    transition: background 0.15s ease;

    &:hover {
      background: #f8fafc;
    }
  }

  :deep(tbody td) {
    padding: 8px 10px;
    font-size: 13px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }
}

.action-buttons {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
}

.no-data-text {
  margin: 8px 0 0;
  font-size: 13px;
  color: #718096;
}

@media (max-width: 768px) {
  .form-content {
    padding: 10px;
  }

  .compact-input {
    :deep(.q-field__control) {
      height: 38px;
      min-height: 38px;
    }
  }
}
</style>

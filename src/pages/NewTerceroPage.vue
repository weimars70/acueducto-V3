<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { terceroService } from '../services/api/tercero.service';
import type { CreateTerceroDto } from '../types/tercero';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../services/api/client';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

// Opciones para selects
const ciudades = ref<any[]>([]);
const regimenes = ref<any[]>([]);
const tiposIdent = ref<any[]>([]);
const tiposImpuesto = ref<any[]>([]);
const tiposContacto = ref<any[]>([]);

// Contactos temporales
const contactos = ref<any[]>([]);
const contactoForm = ref({
  tipoContacto: null,
  nombre: '',
  telefono: '',
  direccion: '',
  correo: ''
});

const formData = ref<CreateTerceroDto>({
  empresaId: authStore.user?.empresaId || 0,
  ciudadCodigo: '',
  nombre: '',
  identificacion: '',
  dv: undefined,
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  direccion: '',
  telefono: '',
  email: '',
  regimen: undefined,
  tipoIdent: undefined,
  tipoImpuesto: undefined,
  cliente: false,
  proveedor: false,
  activo: true,
  usuario: authStore.user?.email || ''
});

// Computed: Determina si el tipo de identificación es NIT
const esNIT = computed(() => {
  if (!formData.value.tipoIdent) return false;
  const tipoSelected = tiposIdent.value.find(t => t.value === formData.value.tipoIdent);
  return tipoSelected?.label?.toUpperCase().includes('NIT') || false;
});

// Watcher: Auto-completar nombre completo cuando NO es NIT
watch(
  [() => formData.value.nombres, () => formData.value.primerApellido, () => formData.value.segundoApellido, esNIT],
  () => {
    if (!esNIT.value) {
      // Concatenar nombres y apellidos
      const partes = [
        formData.value.nombres?.trim(),
        formData.value.primerApellido?.trim(),
        formData.value.segundoApellido?.trim()
      ].filter(Boolean);

      formData.value.nombre = partes.join(' ');
    }
  }
);

// Watcher: Limpiar campos según el tipo de identificación
watch(esNIT, (esNitNuevo) => {
  if (esNitNuevo) {
    // Si es NIT, limpiar nombres y apellidos
    formData.value.nombres = '';
    formData.value.primerApellido = '';
    formData.value.segundoApellido = '';
  } else {
    // Si NO es NIT, el nombre se auto-calculará
    formData.value.nombre = '';
  }
});

const loadSelectOptions = async () => {
  try {
    const empresaId = authStore.user?.empresaId;

    // Cargar ciudades
    const ciudadesResp = await apiClient.get('/terceros/select/ciudades', { params: { empresaId } });
    ciudades.value = ciudadesResp.data.map((c: any) => ({ label: c.nombre, value: c.codigo }));

    // Cargar regímenes
    const regimenesResp = await apiClient.get('/terceros/select/tipo-regimen', { params: { empresaId } });
    regimenes.value = regimenesResp.data.map((r: any) => ({ label: r.nombre, value: r.codigo }));

    // Cargar tipos de identificación
    const tiposIdentResp = await apiClient.get('/terceros/select/tipo-ident', { params: { empresaId } });
    tiposIdent.value = tiposIdentResp.data.map((t: any) => ({ label: t.nombre, value: t.codigo }));

    // Cargar tipos de impuesto
    const tiposImpuestoResp = await apiClient.get('/terceros/select/tipo-impuesto', { params: { empresaId } });
    tiposImpuesto.value = tiposImpuestoResp.data.map((t: any) => ({ label: t.nombre, value: t.codigo }));

    // Cargar tipos de contacto
    const tiposContactoData = await terceroService.getTiposContacto();
    console.log('Tipos de contacto recibidos:', tiposContactoData);
    tiposContacto.value = tiposContactoData.map((t: any) => ({ label: t.nombre, value: t.codigo }));
    console.log('Tipos de contacto mapeados:', tiposContacto.value);

  } catch (error) {
    console.error('Error cargando opciones:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar opciones'
    });
  }
};

const agregarContacto = () => {
  if (!contactoForm.value.nombre || !contactoForm.value.telefono) {
    $q.notify({
      type: 'warning',
      message: 'Nombre y Teléfono son obligatorios para agregar un contacto'
    });
    return;
  }

  const tipoNombre = tiposContacto.value.find(t => t.value === contactoForm.value.tipoContacto)?.label || '';

  const nuevoContacto = {
    ...contactoForm.value,
    tipoContactoNombre: tipoNombre,
    id: Date.now() // ID temporal para poder eliminar
  };

  console.log('Agregando contacto:', nuevoContacto);
  contactos.value.push(nuevoContacto);
  console.log('Total contactos:', contactos.value.length, contactos.value);

  // Limpiar formulario
  contactoForm.value = {
    tipoContacto: null,
    nombre: '',
    telefono: '',
    direccion: '',
    correo: ''
  };

  $q.notify({
    type: 'positive',
    message: 'Contacto agregado a la lista'
  });
};

const eliminarContacto = (id: number) => {
  contactos.value = contactos.value.filter(c => c.id !== id);
  $q.notify({
    type: 'info',
    message: 'Contacto eliminado de la lista'
  });
};

const handleSubmit = async () => {
  if (!formData.value.nombre || !formData.value.ciudadCodigo) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Nombre y Ciudad)'
    });
    return;
  }

  try {
    loading.value = true;

    // Preparar datos con contactos
    const payload = {
      ...formData.value,
      contactos: contactos.value.map(c => ({
        cargo: c.tipoContacto,
        nombre: c.nombre,
        telefono: c.telefono,
        direccion: c.direccion,
        correo: c.correo
      }))
    };

    await terceroService.create(payload);
    $q.notify({
      type: 'positive',
      message: 'Tercero creado exitosamente'
    });
    router.push('/terceros');
  } catch (error: any) {
    console.error('Error al crear tercero:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al crear el tercero';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/terceros');
};

onMounted(() => {
  loadSelectOptions();
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
          @click="handleCancel"
          class="back-btn"
        >
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
        <div class="header-content">
          <q-icon name="person_add" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Nuevo Tercero</h1>
            <p class="form-subtitle">Complete la información del tercero (cliente/proveedor)</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Primera Fila: Identificación y Nombres -->
          <div class="form-section">
            <div class="row q-col-gutter-xs">
              <!-- Tipo Identificación -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Identificación</label>
                  <q-select
                    v-model="formData.tipoIdent"
                    :options="tiposIdent"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Tipo"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" size="18px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Identificación -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Identificación</label>
                  <q-input
                    v-model="formData.identificacion"
                    placeholder="Número"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fingerprint" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- DV -->
              <div class="col-12 col-md-1">
                <div class="input-wrapper">
                  <label class="input-label">DV</label>
                  <q-input
                    v-model.number="formData.dv"
                    type="number"
                    placeholder="0"
                    outlined
                    dense
                    class="modern-input"
                  />
                </div>
              </div>

              <!-- Nombres (doble de ancho que apellidos) -->
              <div class="col-12" style="flex: 0 0 28%; max-width: 28%;">
                <div class="input-wrapper">
                  <label class="input-label">Nombres</label>
                  <q-input
                    v-model="formData.nombres"
                    placeholder="Nombres"
                    outlined
                    dense
                    :disable="esNIT"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Primer Apellido -->
              <div class="col-12" style="flex: 0 0 14%; max-width: 14%;">
                <div class="input-wrapper">
                  <label class="input-label">Primer Apellido</label>
                  <q-input
                    v-model="formData.primerApellido"
                    placeholder="Primer apellido"
                    outlined
                    dense
                    :disable="esNIT"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Segundo Apellido -->
              <div class="col-12" style="flex: 0 0 14%; max-width: 14%;">
                <div class="input-wrapper">
                  <label class="input-label">Segundo Apellido</label>
                  <q-input
                    v-model="formData.segundoApellido"
                    placeholder="Segundo apellido"
                    outlined
                    dense
                    :disable="esNIT"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Segunda Fila: Nombre Completo y Contacto -->
          <div class="form-section">
            <div class="row q-col-gutter-xs">
              <!-- Nombre Completo / Razón Social -->
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo / Razón Social <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Nombre completo o razón social"
                    outlined
                    dense
                    :disable="!esNIT"
                    :readonly="!esNIT"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    :bg-color="!esNIT ? 'grey-2' : 'white'"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Ciudad -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Ciudad <span class="required">*</span></label>
                  <q-select
                    v-model="formData.ciudadCodigo"
                    :options="ciudades"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_city" color="grey-6" size="18px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Dirección -->
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Dirección</label>
                  <q-input
                    v-model="formData.direccion"
                    placeholder="Dirección completa"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Teléfono -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Teléfono</label>
                  <q-input
                    v-model="formData.telefono"
                    placeholder="Teléfono"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Email -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Email</label>
                  <q-input
                    v-model="formData.email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Tercera Fila: Información Tributaria y Clasificación -->
          <div class="form-section">
            <div class="row q-col-gutter-xs">
              <!-- Régimen -->
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Régimen</label>
                  <q-select
                    v-model="formData.regimen"
                    :options="regimenes"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione régimen"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" size="18px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Tipo Impuesto -->
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Impuesto</label>
                  <q-select
                    v-model="formData.tipoImpuesto"
                    :options="tiposImpuesto"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione tipo"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="percent" color="grey-6" size="18px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Activo -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Activo</label>
                  <q-toggle
                    v-model="formData.activo"
                    color="positive"
                    class="modern-toggle"
                  />
                </div>
              </div>

              <!-- Es Cliente -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Clasificación</label>
                  <q-checkbox
                    v-model="formData.cliente"
                    label="Es Cliente"
                    color="primary"
                    class="modern-checkbox"
                  />
                </div>
              </div>

              <!-- Es Proveedor -->
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">&nbsp;</label>
                  <q-checkbox
                    v-model="formData.proveedor"
                    label="Es Proveedor"
                    color="secondary"
                    class="modern-checkbox"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de Contactos -->
          <div class="form-section contactos-section">
            <div class="section-header">
              <q-icon name="contacts" size="18px" color="primary" />
              <h3 class="section-title">Contactos</h3>
            </div>

            <!-- Formulario inline de contacto -->
            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Tipo de Contacto</label>
                  <q-select
                    v-model="contactoForm.tipoContacto"
                    :options="tiposContacto"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Tipo"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" size="16px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Nombre del Contacto <span class="required">*</span></label>
                  <q-input
                    v-model="contactoForm.nombre"
                    placeholder="Ej: Juan Pérez"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" size="16px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Teléfono <span class="required">*</span></label>
                  <q-input
                    v-model="contactoForm.telefono"
                    placeholder="Ej: 300 123 4567"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" size="16px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Dirección del Contacto</label>
                  <q-input
                    v-model="contactoForm.direccion"
                    placeholder="Dirección"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" color="grey-6" size="16px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Correo Electrónico</label>
                  <q-input
                    v-model="contactoForm.correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" size="16px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-1">
                <q-btn
                  unelevated
                  color="positive"
                  icon="add"
                  label="Agregar"
                  @click="agregarContacto"
                  dense
                  class="full-width"
                  style="height: 32px;"
                />
              </div>
            </div>

            <!-- Tabla de contactos -->
            <q-table
              v-if="contactos.length > 0"
              :rows="contactos"
              :columns="[
                { name: 'tipo', label: 'Tipo', field: 'tipoContactoNombre', align: 'left' },
                { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
                { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
                { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
                { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
                { name: 'actions', label: 'Acción', field: 'actions', align: 'center' }
              ]"
              row-key="id"
              flat
              dense
              hide-pagination
              :rows-per-page-options="[0]"
              class="contactos-table"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="eliminarContacto(props.row.id)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>

            <div v-else class="no-contactos">
              <q-icon name="contacts_outline" size="32px" color="grey-5" />
              <p class="text-grey-6" style="font-size: 12px; margin-top: 8px;">No hay contactos agregados</p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <q-btn
              outline
              label="Cancelar"
              color="grey-7"
              class="action-btn cancel-btn"
              @click="handleCancel"
              :disable="loading"
              icon="close"
            />
            <q-btn
              unelevated
              label="Guardar Tercero"
              type="submit"
              color="primary"
              class="action-btn save-btn"
              :loading="loading"
              icon="save"
            />
          </div>
        </q-form>
      </q-card>
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
  max-width: 1400px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 16px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 8px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 60px;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0;
  font-size: 26px;
  font-weight: 500;
  color: #1a202c;
  line-height: 1.2;
}

.form-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 16px;
}

.form-section {
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 8px;
  }
}

.input-wrapper {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 2px;
  letter-spacing: 0.2px;
}

.required {
  color: #e53e3e;
  font-weight: 600;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 6px;
    height: 32px;
    min-height: 32px;
    background: #fafafa;
    transition: all 0.3s ease;

    &:before {
      border-color: #e2e8f0;
    }

    &:hover:before {
      border-color: #cbd5e0;
    }
  }

  :deep(.q-field__control--focused) {
    background: white;

    &:before {
      border-color: #3b82f6 !important;
      border-width: 1px !important;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-size: 12px;
    color: #2d3748;
    font-weight: 500;
    padding: 0 8px;
  }

  :deep(.q-field__prepend) {
    padding-right: 4px;
  }

  :deep(.q-icon) {
    font-size: 16px;
  }
}

.modern-checkbox,
.modern-toggle {
  :deep(.q-checkbox__label),
  :deep(.q-toggle__label) {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.2px;
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

.contactos-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 2px solid #1976d2;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
}

.contactos-table {
  margin-top: 8px;

  :deep(thead tr th) {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 10px;
    padding: 6px 8px;
    border-bottom: 1px solid #e2e8f0;
  }

  :deep(tbody td) {
    padding: 6px 8px;
    font-size: 11px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }
}

.no-contactos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 6px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .form-content {
    padding: 24px;
  }

  .form-title {
    font-size: 22px;
  }

  .form-subtitle {
    font-size: 13px;
  }

  .header-content {
    padding-left: 50px;
  }

  .form-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}
</style>

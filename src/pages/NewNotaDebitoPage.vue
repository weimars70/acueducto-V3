<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { notaDebitoService } from '../services/api/nota-debito.service';
import { instalacionesService } from '../services/api/instalaciones.service';
import { notaDebitoConceptoService } from '../services/api/nota-debito-concepto.service';
import { useAuthStore } from '../stores/auth';
import type { CreateNotaDebitoDto } from '../types/nota-debito';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const optionsInstalaciones = ref<any[]>([]);
const optionsConceptos = ref<any[]>([]);

// Display refs for masking
const valorDisplay = ref('');
const disponibleDisplay = ref('');

const formData = ref<CreateNotaDebitoDto>({
  instalacionCodigo: null as any,
  clienteNombre: '',
  fecha: new Date().toISOString().split('T')[0],
  valor: 0,
  disponible: 0,
  concepto: null as any,
  observacion: '',
  empresaId: 1, // Esto debería venir del store de auth si está disponible
  usuario: authStore.user?.email || ''
});

onMounted(async () => {
  try {
    const conceptos = await notaDebitoConceptoService.getAll();
    optionsConceptos.value = conceptos.map(c => ({
      label: c.descripcion,
      value: c.codigo
    }));
  } catch (error) {
    console.error('Error cargando conceptos', error);
    $q.notify({ type: 'negative', message: 'Error cargando conceptos' });
  }
});

// Watcher to parse formatted value into numbers
watch(valorDisplay, (val) => {
  if (!val) {
    formData.value.valor = 0;
    formData.value.disponible = 0;
    disponibleDisplay.value = '';
    return;
  }

  // Remove dots (thousands) and replace comma with dot (decimal)
  // Format mask: #.###,##
  const cleanVal = val.replace(/\./g, '').replace(',', '.');
  const numVal = parseFloat(cleanVal);
  
  formData.value.valor = isNaN(numVal) ? 0 : numVal;
  formData.value.disponible = formData.value.valor;
  disponibleDisplay.value = val; // Sync display
});

const filterInstalaciones = async (val: string, update: any) => {
  if (val === '') {
    update(() => {
      optionsInstalaciones.value = [];
    });
    return;
  }

  update(async () => {
    try {
      const results = await instalacionesService.getAll(undefined, val);
      optionsInstalaciones.value = results.map(i => ({
        label: `${i.codigo} - ${i.nombre}`,
        value: i.codigo,
        cliente: i.nombre
      }));
    } catch (error) {
      console.error('Error buscando instalaciones', error);
    }
  });
};

const onSelectInstalacion = (val: any) => {
  if (val) {
    formData.value.instalacionCodigo = val.value;
    formData.value.clienteNombre = val.cliente;
  }
};

const handleSubmit = async () => {
  // Asegurar que usemos el valor simple si es un objeto (por el select)
  const instalacionVal = typeof formData.value.instalacionCodigo === 'object' 
    ? (formData.value.instalacionCodigo as any).value 
    : formData.value.instalacionCodigo;
    
  const conceptoVal = typeof formData.value.concepto === 'object'
    ? (formData.value.concepto as any).value
    : formData.value.concepto;

  if (!instalacionVal) {
    $q.notify({ type: 'warning', message: 'El código de instalación es obligatorio' });
    return;
  }

  if (!formData.value.valor || formData.value.valor <= 0) {
    $q.notify({ type: 'warning', message: 'El valor debe ser mayor a cero' });
    return;
  }

  try {
    loading.value = true;
    
    // Preparar payload limpio
    const payload = {
      ...formData.value,
      instalacionCodigo: instalacionVal,
      concepto: conceptoVal,
      disponible: formData.value.disponible || formData.value.valor // Asegurar disponible
    };

    await notaDebitoService.create(payload);
    $q.notify({ type: 'positive', message: 'Nota débito creada exitosamente' });
    router.push('/notas-debito');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al crear la nota débito' });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/notas-debito');
};
</script>

<template>
  <q-page class="new-nota-debito-page">
    <div class="page-container">
      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Header -->
          <div class="page-header">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="primary"
              @click="handleCancel"
              class="q-mr-md"
            />
            <div class="header-content">
              <div class="title-section">
                <q-icon name="description" size="32px" color="primary" class="q-mr-sm" />
                <div>
                  <h1 class="page-title">Nueva Nota Débito</h1>
                  <p class="page-subtitle">Complete la información para crear una nueva nota débito</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <q-card class="form-card">
            <q-form @submit="handleSubmit">
              <q-card-section class="q-pa-lg">
                <!-- Información General -->
                <div class="section-header">
                  <q-icon name="info" size="24px" color="primary" />
                  <span class="section-title">Información General</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <label class="field-label">Código de Instalación <span class="text-negative">*</span></label>
                    <q-select
                      outlined
                      dense
                      v-model="formData.instalacionCodigo"
                      use-input
                      input-debounce="300"
                      :options="optionsInstalaciones"
                      @filter="filterInstalaciones"
                      @update:model-value="onSelectInstalacion"
                      placeholder="Buscar instalación (Código o Nombre)"
                      :rules="[val => !!val || 'El código de instalación es requerido']"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="home" color="grey-6" />
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sin resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Nombre del Cliente</label>
                    <q-input
                      outlined
                      dense
                      v-model="formData.clienteNombre"
                      placeholder="Se llenará automáticamente"
                      readonly
                      class="modern-input bg-grey-1"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Fecha</label>
                    <q-input
                      outlined
                      dense
                      v-model="formData.fecha"
                      type="date"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Concepto</label>
                    <q-select
                      outlined
                      dense
                      v-model="formData.concepto"
                      :options="optionsConceptos"
                      emit-value
                      map-options
                      placeholder="Seleccione un concepto"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="category" color="grey-6" />
                      </template>
                    </q-select>
                  </div>
                </div>

                <!-- Valores -->
                <div class="section-header q-mt-lg">
                  <q-icon name="attach_money" size="24px" color="primary" />
                  <span class="section-title">Valores</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <label class="field-label">Valor Total <span class="text-negative">*</span></label>
                    <q-input
                      outlined
                      dense
                      v-model="valorDisplay"
                      placeholder="0,00"
                      mask="#.###,##"
                      reverse-fill-mask
                      class="modern-input"
                      :rules="[val => (formData.valor && formData.valor > 0) || 'El valor debe ser mayor a cero']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="monetization_on" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Valor Disponible</label>
                    <q-input
                      outlined
                      dense
                      v-model="disponibleDisplay"
                      placeholder="0,00"
                      readonly
                      mask="#.###,##"
                      reverse-fill-mask
                      class="modern-input bg-grey-1"
                    >
                      <template v-slot:prepend>
                        <q-icon name="account_balance_wallet" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Observaciones -->
                <div class="section-header q-mt-lg">
                  <q-icon name="notes" size="24px" color="primary" />
                  <span class="section-title">Observaciones</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row">
                  <div class="col-12">
                    <q-input
                      outlined
                      v-model="formData.observacion"
                      type="textarea"
                      rows="4"
                      placeholder="Ingrese observaciones adicionales..."
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>

              <!-- Actions -->
              <q-separator />
              <q-card-actions class="q-pa-lg bg-grey-1">
                <div class="row full-width q-gutter-sm justify-end">
                  <q-btn
                    outline
                    color="grey-7"
                    label="Cancelar"
                    icon="close"
                    @click="handleCancel"
                    :disable="loading"
                    class="action-button"
                    no-caps
                  />
                  <q-btn
                    unelevated
                    type="submit"
                    color="primary"
                    label="Guardar"
                    icon="save"
                    :loading="loading"
                    class="action-button"
                    no-caps
                  />
                </div>
              </q-card-actions>
            </q-form>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.new-nota-debito-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.modern-input {
  :deep(.q-field__control) {
    height: 48px;
    border-radius: 12px;
  }

  :deep(.q-field__control:hover) {
    border-color: #3b82f6;
  }

  :deep(.q-field__native) {
    font-size: 14px;
    color: #2d3748;
  }
}

.action-button {
  min-width: 140px;
  height: 44px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .action-button {
    width: 100%;
  }
}
</style>

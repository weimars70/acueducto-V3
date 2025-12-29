<template>
  <q-page class="page-container">
    <div class="form-card">
      <!-- Header -->
      <div class="form-header">
        <q-icon name="edit" size="32px" />
        <div>
          <h1 class="form-title">Editar Instalación</h1>
          <p class="form-subtitle">Modificar datos de la instalación</p>
        </div>
      </div>

      <q-inner-loading :showing="loadingData">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <q-form v-if="!loadingData" @submit="handleSubmit" class="form-content">
        <!-- Sección: Datos del Suscriptor -->
        <div class="section">
          <div class="section-header">
            <q-icon name="person" size="20px" />
            <span class="section-title">Datos del Suscriptor</span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-2">
              <label class="field-label">Suscriptor</label>
              <q-input
                v-model="form.suscriptor"
                outlined
                dense
                placeholder="Código suscriptor"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Ruta <span class="text-negative">*</span></label>
              <q-input
                v-model="form.sector"
                outlined
                dense
                placeholder="Ruta"
                :rules="[val => !!val || 'Ruta es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="route" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Identificación <span class="text-negative">*</span></label>
              <q-input
                v-model="form.ident"
                outlined
                dense
                placeholder="Número identificación"
                :rules="[val => !!val || 'Identificación es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="credit_card" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-1">
              <label class="field-label">DV</label>
              <q-input
                v-model="form.dv"
                outlined
                dense
                maxlength="2"
                placeholder="DV"
                readonly
                :bg-color="form.dv ? 'grey-3' : undefined"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <label class="field-label">Nombres <span class="text-negative">*</span></label>
              <q-input
                v-model="form.nombres"
                outlined
                dense
                placeholder="Nombres"
                :rules="[val => !!val || 'Nombres es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <label class="field-label">Primer Apellido</label>
              <q-input
                v-model="form.primer_apellido"
                outlined
                dense
                placeholder="Primer apellido"
              />
            </div>

            <div class="col-12 col-md-3">
              <label class="field-label">Segundo Apellido</label>
              <q-input
                v-model="form.segundo_apellido"
                outlined
                dense
                placeholder="Segundo apellido"
              />
            </div>
          </div>
        </div>

        <!-- Sección: Información Fiscal y Contacto -->
        <div class="section">
          <div class="section-header">
            <q-icon name="account_balance" size="20px" />
            <span class="section-title">Información Fiscal y Contacto</span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <label class="field-label">Email</label>
              <q-input
                v-model="form.email"
                type="email"
                outlined
                dense
                placeholder="correo@ejemplo.com"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Régimen</label>
              <q-select
                v-model="form.regimen"
                :options="regimenes"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="gavel" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Tipo Persona</label>
              <q-select
                v-model="form.tipo_persona"
                :options="tiposPersona"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Tipo Impuesto</label>
              <q-select
                v-model="form.tipo_impuesto"
                :options="tiposImpuesto"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="receipt" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Centro Costos</label>
              <q-select
                v-model="form.centro_costos"
                :options="centrosCostos"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="account_tree" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-1 flex items-center">
              <q-checkbox
                v-model="form.factura_fisica"
                label="Facturar Solo Intereses"
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-2">
              <q-checkbox
                v-model="form.enviar_factura_email"
                label="Factura Email"
                dense
              />
            </div>

            <div class="col-12 col-md-2">
              <q-checkbox
                v-model="form.enviar_factura_whatsapp"
                label="Factura WhatsApp"
                dense
              />
            </div>
          </div>
        </div>

        <!-- Sección: Ubicación y Datos Adicionales -->
        <div class="section">
          <div class="section-header">
            <q-icon name="location_on" size="20px" />
            <span class="section-title">Ubicación y Datos Adicionales</span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <label class="field-label">Dirección <span class="text-negative">*</span></label>
              <q-input
                v-model="form.direccion"
                outlined
                dense
                placeholder="Dirección completa"
                :rules="[val => !!val || 'Dirección es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Ciudad</label>
              <q-select
                v-model="form.ciudad_codigo"
                :options="ciudadesFiltradas"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="filterCiudades"
                placeholder="Buscar ciudad..."
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No se encontraron ciudades
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Teléfono</label>
              <q-input
                v-model="form.telefono"
                outlined
                dense
                placeholder="Número telefónico"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Estrato</label>
              <q-select
                v-model="form.estrato_codigo"
                :options="estratos"
                option-value="codigo"
                option-label="nombre"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="stairs" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-1 flex items-center">
              <q-checkbox
                v-model="form.activo"
                label="Activo"
                dense
              />
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <q-btn
            label="Cancelar"
            color="grey-7"
            outline
            icon="close"
            @click="handleCancel"
            class="cancel-btn"
          />
          <q-btn
            label="Actualizar"
            type="submit"
            color="primary"
            unelevated
            icon="save"
            :loading="loading"
            class="save-btn"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { instalacionesService, type Instalacion } from '../services/api/instalaciones.service';
import { tipoRegimenService } from '../services/api/tipo-regimen.service';
import { tipoPersonaService } from '../services/api/tipo-persona.service';
import { tipoImpuestoService } from '../services/api/tipo-impuesto.service';
import { centroCostosService } from '../services/api/centro-costos.service';
import { ciudadService } from '../services/api/ciudad.service';
import { estratosService } from '../services/api/estratos.service';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();
const loading = ref(false);
const loadingData = ref(true);

/**
 * Calcula el dígito de verificación para Colombia
 * @param {string|number} nit - El número de identificación tributaria
 * @returns {string|null} El dígito de verificación (0-9) o null si no hay NIT
 */
const calcularDV = (nit: string | number): string | null => {
  // Convertir a string y limpiar caracteres no numéricos
  let tempNit = nit.toString().replace(/\D/g, '');

  if (tempNit.length === 0) return null;

  const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let suma = 0;

  // Recorrer el NIT de derecha a izquierda
  for (let i = 0; i < tempNit.length; i++) {
    const digito = parseInt(tempNit.charAt(tempNit.length - 1 - i));
    suma += digito * pesos[i];
  }

  const residuo = suma % 11;

  // Si el residuo es 0 o 1, ese es el DV. Si es > 1, es 11 menos el residuo.
  return (residuo > 1 ? 11 - residuo : residuo).toString();
};

const form = ref<Instalacion>({
  nombre: '',
  activo: true,
  enviar_factura_email: false,
  enviar_factura_whatsapp: false,
  factura_fisica: false,
  lectura: 0
});

// Referencias para selects
const regimenes = ref<any[]>([]);
const tiposPersona = ref<any[]>([]);
const tiposImpuesto = ref<any[]>([]);
const centrosCostos = ref<any[]>([]);
const ciudades = ref<any[]>([]);
const ciudadesFiltradas = ref<any[]>([]);
const estratos = ref<any[]>([]);

const loadCatalogs = async () => {
  try {
    const empresaId = authStore.user?.empresaId;

    const [
      regimenesData,
      tiposPersonaData,
      tiposImpuestoData,
      centrosCostosData,
      ciudadesData,
      estratosData
    ] = await Promise.all([
      tipoRegimenService.getAll(empresaId),
      tipoPersonaService.getAll(empresaId),
      tipoImpuestoService.getAll(empresaId),
      centroCostosService.getAll(empresaId),
      ciudadService.getAll(empresaId),
      estratosService.getAll(empresaId)
    ]);

    regimenes.value = regimenesData;
    tiposPersona.value = tiposPersonaData;
    tiposImpuesto.value = tiposImpuestoData;
    centrosCostos.value = centrosCostosData;
    ciudades.value = ciudadesData;
    ciudadesFiltradas.value = ciudadesData;
    estratos.value = estratosData;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar catálogos: ' + error.message,
      position: 'top'
    });
  }
};

const loadInstalacion = async () => {
  try {
    const codigo = Number(route.params.codigo);
    if (!codigo) {
      throw new Error('Código de instalación no válido');
    }

    const instalacion = await instalacionesService.getByCode(codigo);
    form.value = { ...instalacion };
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al cargar instalación',
      position: 'top'
    });
    router.push('/instalaciones');
  }
};

// Watcher para calcular automáticamente el DV cuando cambie el campo ident
watch(() => form.value.ident, (newIdent) => {
  if (newIdent) {
    const dv = calcularDV(newIdent);
    form.value.dv = dv;
  } else {
    form.value.dv = '';
  }
});

const filterCiudades = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      ciudadesFiltradas.value = ciudades.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    ciudadesFiltradas.value = ciudades.value.filter(
      (ciudad: any) => ciudad.nombre.toLowerCase().indexOf(needle) > -1
    );
  });
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const codigo = Number(route.params.codigo);

    // Construir el nombre completo
    const nombreCompleto = [
      form.value.nombres,
      form.value.primer_apellido,
      form.value.segundo_apellido
    ].filter(Boolean).join(' ');

    const instalacionData = {
      ...form.value,
      nombre: nombreCompleto || form.value.nombre
    };

    await instalacionesService.update(codigo, instalacionData);

    $q.notify({
      type: 'positive',
      message: 'Instalación actualizada exitosamente',
      position: 'top'
    });

    router.push('/instalaciones');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al actualizar instalación',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/instalaciones');
};

onMounted(async () => {
  await loadCatalogs();
  await loadInstalacion();
  loadingData.value = false;
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.form-card {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 3px solid #f0f0f0;
}

.form-header .q-icon {
  color: #1976d2;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.form-subtitle {
  font-size: 13px;
  color: #666;
  margin: 2px 0 0 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #1976d2;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.section-header .q-icon {
  color: #1976d2;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
}

:deep(.q-field__control) {
  height: 40px;
  border-radius: 10px;
}

:deep(.q-field__marginal) {
  height: 40px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
  margin-top: 8px;
}

/* Estilos para botones - siguiendo patrón de NewConsumptionForm */
.cancel-btn,
.save-btn {
  min-width: 120px;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #fff4e6 !important;
  border-color: #fb923c !important;
  color: #ea580c !important;
}

.save-btn:hover {
  background: #28A745 !important;
  border-color: #28A745 !important;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
}

@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .form-card {
    padding: 16px;
    border-radius: 12px;
  }

  .form-header {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }

  .form-title {
    font-size: 20px;
  }

  .form-content {
    gap: 12px;
  }

  .section {
    padding: 12px;
  }

  .section-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
  }

  :deep(.q-field__control) {
    height: 38px;
  }

  :deep(.q-field__marginal) {
    height: 38px;
  }

  .field-label {
    font-size: 11px;
    margin-bottom: 3px;
  }

  .form-actions {
    flex-direction: column;
    padding-top: 12px;
    margin-top: 4px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    height: 40px;
  }
}
</style>

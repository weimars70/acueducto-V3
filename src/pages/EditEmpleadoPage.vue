<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { empleadoService } from '../services/api/empleado.service';
import { tipoIdentService } from '../services/api/tipo-ident.service';
import { ciudadService } from '../services/api/ciudad.service';
import { bancoService } from '../services/api/banco.service';
import { nominaCatalogsService } from '../services/api/nomina-catalogs.service';
import { useAuthStore } from '../stores/auth';
import type { UpdateEmpleadoDto } from '../types/empleado';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const loadingData = ref(true);

// Opciones de catálogos
interface Option {
  label: string;
  value: string | number;
}

const tipoIdentOptions = ref<Option[]>([]);
const ciudadOptions = ref<Option[]>([]);
const bancoOptions = ref<Option[]>([]);
const tipoTrabajadorOptions = ref<Option[]>([]);
const subtipoTrabajadorOptions = ref<Option[]>([]);
const tipoContratoOptions = ref<Option[]>([]);
const formasPagosOptions = ref<Option[]>([]);
const tipoCuentaOptions = ref<Option[]>([]);

const formData = ref<UpdateEmpleadoDto>({
  cedula: '',
  nombre_completo: '',
  primer_nombre: '',
  otros_nombres: '',
  primer_apellido: '',
  segundo_apellido: '',
  salario_mensual: 0,
  auxilio_transporte: false,
  activo: true,
  fecha_ingreso: '',
  fecha_retiro: '',
  cargo: '',
  email: '',
  direccion: '',
  municipio_id: '',
  tipo_documento_id: undefined,
  tipo_trabajador_id: undefined,
  subtipo_trabajador_id: undefined,
  tipo_contrato_id: undefined,
  metodo_pago_id: undefined,
  banco: undefined,
  alto_riesgo_pension: false,
  salario_integral: false,
  tipo_cuenta: undefined,
  numero_cuenta: ''
});

const updateFullName = () => {
  const parts = [
    formData.value.primer_nombre,
    formData.value.otros_nombres,
    formData.value.primer_apellido,
    formData.value.segundo_apellido
  ].filter(p => !!p);
  formData.value.nombre_completo = parts.join(' ');
};

const loadCatalogs = async () => {
  try {
    const [
      idents,
      ciudades,
      bancos,
      trabajadores,
      subtrabajadores,
      contratos,
      pagos,
      cuentas
    ] = await Promise.all([
      tipoIdentService.getTipoIdents({ limit: 1000, empresaId: authStore.user?.empresaId }),
      ciudadService.getAll(),
      bancoService.getBancos({ limit: 1000 }),
      nominaCatalogsService.getTipoTrabajador(),
      nominaCatalogsService.getSubtipoTrabajador(),
      nominaCatalogsService.getTipoContrato(),
      nominaCatalogsService.getFormasPagos(),
      nominaCatalogsService.getTipoCuenta()
    ]);

    tipoIdentOptions.value = idents.data.map(i => ({ label: i.nombre, value: Number(i.codigo) }));
    ciudadOptions.value = ciudades.map(c => ({ label: c.nombre, value: c.codigo }));
    bancoOptions.value = bancos.data.map(b => ({ label: b.nombre, value: Number(b.id) }));
    tipoTrabajadorOptions.value = trabajadores.map((t: any) => ({ label: t.nombre, value: Number(t.id) }));
    subtipoTrabajadorOptions.value = subtrabajadores.map((s: any) => ({ label: s.nombre, value: Number(s.id) }));
    tipoContratoOptions.value = contratos.map((c: any) => ({ label: c.nombre, value: Number(c.id) }));
    formasPagosOptions.value = pagos.map((p: any) => ({ label: p.nombre, value: Number(p.id) }));
    tipoCuentaOptions.value = cuentas.map((c: any) => ({ label: c.nombre, value: Number(c.id) }));
  } catch (error) {
    console.error('Error al cargar catálogos:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar catálogos' });
  }
};

const loadEmpleado = async () => {
  try {
    loadingData.value = true;
    const id = Number(route.params.id);
    const empleado = await empleadoService.getEmpleado(id);

    formData.value = {
      cedula: empleado.cedula,
      nombre_completo: empleado.nombre_completo,
      primer_nombre: empleado.primer_nombre || '',
      otros_nombres: empleado.otros_nombres || '',
      primer_apellido: empleado.primer_apellido || '',
      segundo_apellido: empleado.segundo_apellido || '',
      salario_mensual: Number(empleado.salario_mensual),
      auxilio_transporte: !!empleado.auxilio_transporte,
      activo: !!empleado.activo,
      fecha_ingreso: empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toISOString().split('T')[0] : '',
      fecha_retiro: empleado.fecha_retiro ? new Date(empleado.fecha_retiro).toISOString().split('T')[0] : '',
      cargo: empleado.cargo || '',
      email: empleado.email || '',
      direccion: empleado.direccion || '',
      municipio_id: empleado.municipio_id || '',
      tipo_documento_id: empleado.tipo_documento_id ? Number(empleado.tipo_documento_id) : undefined,
      tipo_trabajador_id: empleado.tipo_trabajador_id ? Number(empleado.tipo_trabajador_id) : undefined,
      subtipo_trabajador_id: empleado.subtipo_trabajador_id ? Number(empleado.subtipo_trabajador_id) : undefined,
      tipo_contrato_id: empleado.tipo_contrato_id ? Number(empleado.tipo_contrato_id) : undefined,
      metodo_pago_id: empleado.metodo_pago_id ? Number(empleado.metodo_pago_id) : undefined,
      banco: empleado.banco ? Number(empleado.banco) : undefined,
      alto_riesgo_pension: !!empleado.alto_riesgo_pension,
      salario_integral: !!empleado.salario_integral,
      tipo_cuenta: empleado.tipo_cuenta ? Number(empleado.tipo_cuenta) : undefined,
      numero_cuenta: empleado.numero_cuenta || ''
    };
  } catch (error: any) {
    console.error('Error al cargar empleado:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el empleado'
    });
    router.push('/empleados');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  const required = ['cedula', 'primer_nombre', 'primer_apellido', 'email', 'direccion', 'municipio_id', 'salario_mensual', 'fecha_ingreso'];
  const missing = required.filter(k => !(formData.value as any)[k]);
  
  if (missing.length > 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios'
    });
    return;
  }

  try {
    loading.value = true;
    const id = Number(route.params.id);
    await empleadoService.update(id, formData.value);
    $q.notify({
      type: 'positive',
      message: 'Empleado actualizado exitosamente'
    });
    router.push('/empleados');
  } catch (error: any) {
    console.error('Error al actualizar empleado:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el empleado';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/empleados');
};

onMounted(async () => {
  await loadCatalogs();
  await loadEmpleado();
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
          <q-icon name="badge" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Empleado</h1>
            <p class="form-subtitle">Actualice la información del empleado para nómina electrónica</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card v-if="loadingData" flat class="form-card">
        <q-card-section class="flex flex-center" style="min-height: 400px;">
          <q-spinner-dots size="50px" color="primary" />
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card v-else flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Personal -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="person" size="24px" color="primary" />
              <h2 class="section-title">Información Personal</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Documento <span class="required">*</span></label>
                  <q-select
                    v-model="formData.tipo_documento_id"
                    :options="tipoIdentOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Cédula <span class="required">*</span></label>
                  <q-input
                    v-model="formData.cedula"
                    placeholder="12345678"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo (Automático)</label>
                  <q-input
                    v-model="formData.nombre_completo"
                    readonly
                    outlined
                    class="modern-input bg-grey-2"
                  />
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Primer Nombre <span class="required">*</span></label>
                  <q-input
                    v-model="formData.primer_nombre"
                    @update:model-value="updateFullName"
                    outlined
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Otros Nombres</label>
                  <q-input
                    v-model="formData.otros_nombres"
                    @update:model-value="updateFullName"
                    outlined
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Primer Apellido <span class="required">*</span></label>
                  <q-input
                    v-model="formData.primer_apellido"
                    @update:model-value="updateFullName"
                    outlined
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Segundo Apellido</label>
                  <q-input
                    v-model="formData.segundo_apellido"
                    @update:model-value="updateFullName"
                    outlined
                    class="modern-input"
                  />
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Email <span class="required">*</span></label>
                  <q-input
                    v-model="formData.email"
                    type="email"
                    outlined
                    placeholder="ejemplo@correo.com"
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Dirección <span class="required">*</span></label>
                  <q-input
                    v-model="formData.direccion"
                    outlined
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Municipio/Ciudad <span class="required">*</span></label>
                  <q-select
                    v-model="formData.municipio_id"
                    :options="ciudadOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Información Laboral -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="work" size="24px" color="primary" />
              <h2 class="section-title">Información Laboral</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Cargo</label>
                  <q-input v-model="formData.cargo" outlined class="modern-input" />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Salario Mensual <span class="required">*</span></label>
                  <q-input
                    v-model.number="formData.salario_mensual"
                    type="number"
                    outlined
                    prefix="$"
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Fecha Ingreso <span class="required">*</span></label>
                  <q-input v-model="formData.fecha_ingreso" type="date" outlined class="modern-input" />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Fecha Retiro</label>
                  <q-input v-model="formData.fecha_retiro" type="date" outlined class="modern-input" />
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Trabajador</label>
                  <q-select
                    v-model="formData.tipo_trabajador_id"
                    :options="tipoTrabajadorOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Subtipo Trabajador</label>
                  <q-select
                    v-model="formData.subtipo_trabajador_id"
                    :options="subtipoTrabajadorOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Contrato</label>
                  <q-select
                    v-model="formData.tipo_contrato_id"
                    :options="tipoContratoOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
            </div>

            <div class="row q-mt-md items-center">
              <div class="col-12 col-md-3">
                <q-toggle v-model="formData.auxilio_transporte" label="Auxilio Transporte" color="primary" />
              </div>
              <div class="col-12 col-md-3">
                <q-toggle v-model="formData.alto_riesgo_pension" label="Alto Riesgo Pensión" color="primary" />
              </div>
              <div class="col-12 col-md-3">
                <q-toggle v-model="formData.salario_integral" label="Salario Integral" color="primary" />
              </div>
              <div class="col-12 col-md-3">
                <q-toggle v-model="formData.activo" label="Activo" color="positive" />
              </div>
            </div>
          </div>

          <!-- Sección: Información de Pago -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="payments" size="24px" color="primary" />
              <h2 class="section-title">Información de Pago</h2>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Método de Pago</label>
                  <q-select
                    v-model="formData.metodo_pago_id"
                    :options="formasPagosOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Banco</label>
                  <q-select
                    v-model="formData.banco"
                    :options="bancoOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Cuenta</label>
                  <q-select
                    v-model="formData.tipo_cuenta"
                    :options="tipoCuentaOptions"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Número de Cuenta</label>
                  <q-input v-model="formData.numero_cuenta" outlined class="modern-input" />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <q-btn
              outline
              color="grey-7"
              icon="close"
              label="Cancelar"
              @click="handleCancel"
              :disable="loading"
              class="action-btn cancel-btn"
            />
            <q-btn
              unelevated
              color="primary"
              icon="save"
              label="Guardar Cambios"
              type="submit"
              :loading="loading"
              class="action-btn save-btn"
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
  max-width: 1000px;
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

.form-content {
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.input-wrapper {
  margin-bottom: 8px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.required {
  color: #e53e3e;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    height: 48px;
  }

  :deep(.q-field__prepend) {
    padding-left: 12px;
  }
}

.modern-toggle {
  margin-top: 8px;
}

.hint-text {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.action-btn {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.save-btn {
  background: #3b82f6;

  &:hover {
    background: #10b981;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
}

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .form-content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}
</style>

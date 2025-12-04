<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { userService } from '../services/api/user.service';
import { roleService, type Role } from '../services/api/role.service';
import type { CreateUserDto } from '../types/user';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const roles = ref<Role[]>([]);
const loadingRoles = ref(false);

const formData = ref<CreateUserDto>({
  empresaId: authStore.user?.empresaId || 1,
  roleId: 1,
  name: '',
  email: '',
  phone: '',
  password: '',
  active: true,
  usuario: authStore.user?.email || ''
});

const passwordConfirm = ref('');

// Computed para mostrar el nombre de la empresa (por ahora solo el ID)
const empresaDisplay = computed(() => {
  return `Empresa ${formData.value.empresaId}`;
});

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.email || !formData.value.password) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios'
    });
    return;
  }

  if (formData.value.password !== passwordConfirm.value) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    });
    return;
  }

  if (formData.value.password.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe tener al menos 6 caracteres'
    });
    return;
  }

  try {
    loading.value = true;
    await userService.create(formData.value);
    $q.notify({
      type: 'positive',
      message: 'Usuario creado exitosamente'
    });
    router.push('/users');
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al crear el usuario';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/users');
};

const loadRoles = async () => {
  try {
    loadingRoles.value = true;
    const allRoles = await roleService.getByEmpresa(formData.value.empresaId);
    roles.value = allRoles;
  } catch (error: any) {
    console.error('Error al cargar roles:', error);
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los roles disponibles'
    });
  } finally {
    loadingRoles.value = false;
  }
};

onMounted(() => {
  loadRoles();
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
            <h1 class="form-title">Nuevo Usuario</h1>
            <p class="form-subtitle">Complete la información del usuario</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección:  -->
          <div class="form-section">
            

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo <span class="required">*</span></label>
                  <q-input
                    v-model="formData.name"
                    placeholder="Ej: Juan Pérez"
                    outlined
                    dense
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Email <span class="required">*</span></label>
                  <q-input
                    v-model="formData.email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    outlined
                    dense
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => /.+@.+\..+/.test(val) || 'Email inválido'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Teléfono</label>
                  <q-input
                    v-model="formData.phone"
                    placeholder="Número de contacto"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Credenciales -->
          <div class="form-section">
            

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Contraseña <span class="required">*</span></label>
                  <q-input
                    v-model="formData.password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    outlined
                    dense
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => val.length >= 6 || 'Mínimo 6 caracteres'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Confirmar Contraseña <span class="required">*</span></label>
                  <q-input
                    v-model="passwordConfirm"
                    type="password"
                    placeholder="Repita la contraseña"
                    outlined
                    dense
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => val === formData.password || 'Las contraseñas no coinciden'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="check_circle" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Permisos y Rol -->
          <div class="form-section">
           

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Empresa</label>
                  <q-input
                    :model-value="empresaDisplay"
                    placeholder="Empresa asignada"
                    outlined
                    dense
                    readonly
                    disable
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" size="18px" color="grey-6" />
                    </template>
                  </q-input>
                  <div class="field-hint">Asignada automáticamente</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Rol <span class="required">*</span></label>
                  <q-select
                    v-model="formData.roleId"
                    :options="roles"
                    option-value="id"
                    option-label="nombre"
                    emit-value
                    map-options
                    outlined
                    dense
                    :loading="loadingRoles"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    placeholder="Seleccione un rol"
                  >
                    <template v-slot:prepend>
                      <q-icon name="assignment_ind" size="18px" color="grey-6" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay roles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Estado</label>
                  <div class="toggle-wrapper">
                    <q-toggle
                      v-model="formData.active"
                      label="Usuario Activo"
                      color="positive"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
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
              label="Crear Usuario"
              type="submit"
              color="primary"
              class="action-btn save-btn"
              :loading="loading"
              icon="person_add"
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
  padding: 16px;
}

.form-container {
  max-width: 1600px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 8px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 2px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 50px;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
  color: #1a202c;
  line-height: 1.1;
}

.form-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #718096;
  font-weight: 400;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 12px 24px;
}

.form-section {
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 8px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
}

.input-wrapper {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 4px;
  letter-spacing: 0.2px;
}

.required {
  color: #e53e3e;
  font-weight: 600;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 8px;
    height: 36px;
    min-height: 36px;
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
      border-width: 2px !important;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-size: 13px;
    color: #2d3748;
    font-weight: 500;
  }

  :deep(.q-field__prepend) {
    padding-right: 8px;
  }
}

.toggle-wrapper {
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.toggle-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #718096;
  font-style: italic;
}

.field-hint {
  margin-top: 2px;
  font-size: 11px;
  color: #718096;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
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

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .form-content {
    padding: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-subtitle {
    font-size: 14px;
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

  .section-title {
    font-size: 18px;
  }
}
</style>

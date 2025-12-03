<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { userService } from '../services/api/user.service';
import type { CreateUserDto } from '../types/user';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const formData = ref<CreateUserDto>({
  empresaId: 1,
  roleId: 1,
  name: '',
  email: '',
  phone: '',
  password: '',
  active: true,
  usuario: authStore.user?.email || ''
});

const passwordConfirm = ref('');

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
          <!-- Sección: Información Personal -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="person" size="24px" color="primary" />
              <h2 class="section-title">Información Personal</h2>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo <span class="required">*</span></label>
                  <q-input
                    v-model="formData.name"
                    placeholder="Ej: Juan Pérez"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Email <span class="required">*</span></label>
                  <q-input
                    v-model="formData.email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    outlined
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => /.+@.+\..+/.test(val) || 'Email inválido'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Teléfono</label>
                  <q-input
                    v-model="formData.phone"
                    placeholder="Número de contacto"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Credenciales -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="lock" size="24px" color="primary" />
              <h2 class="section-title">Seguridad y Acceso</h2>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Contraseña <span class="required">*</span></label>
                  <q-input
                    v-model="formData.password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    outlined
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => val.length >= 6 || 'Mínimo 6 caracteres'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" color="grey-6" />
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
                    :rules="[
                      val => !!val || 'Campo requerido',
                      val => val === formData.password || 'Las contraseñas no coinciden'
                    ]"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="check_circle" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Permisos y Rol -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="admin_panel_settings" size="24px" color="primary" />
              <h2 class="section-title">Permisos y Configuración</h2>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Empresa <span class="required">*</span></label>
                  <q-input
                    v-model.number="formData.empresaId"
                    type="number"
                    placeholder="ID de la empresa"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Rol <span class="required">*</span></label>
                  <q-input
                    v-model.number="formData.roleId"
                    type="number"
                    placeholder="ID del rol"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="assignment_ind" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <div class="input-wrapper">
                  <label class="input-label">Estado del Usuario</label>
                  <div class="toggle-wrapper">
                    <q-toggle
                      v-model="formData.active"
                      label="Usuario Activo"
                      color="positive"
                      size="lg"
                    />
                    <span class="toggle-hint">
                      {{ formData.active ? 'El usuario podrá acceder al sistema' : 'El usuario no podrá iniciar sesión' }}
                    </span>
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
              size="lg"
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
              size="lg"
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
  padding: 24px;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 32px;
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
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.form-subtitle {
  margin: 8px 0 0;
  font-size: 16px;
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
  padding: 40px;
}

.form-section {
  margin-bottom: 40px;

  &:last-of-type {
    margin-bottom: 32px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title {
  margin: 0;
  font-size: 20px;
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
  letter-spacing: 0.3px;
}

.required {
  color: #e53e3e;
  font-weight: 700;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    height: 48px;
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
    font-size: 15px;
    color: #2d3748;
    font-weight: 500;
  }

  :deep(.q-field__prepend) {
    padding-right: 12px;
  }
}

.toggle-wrapper {
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.toggle-hint {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #718096;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.action-btn {
  min-width: 160px;
  height: 52px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.cancel-btn {
  &:hover {
    background: #f7fafc;
    border-color: #a0aec0;
  }
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
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

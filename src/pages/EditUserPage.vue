<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { userService } from '../services/api/user.service';
import { roleService, type Role } from '../services/api/role.service';
import type { UpdateUserDto } from '../types/user';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const loadingData = ref(true);
const roles = ref<Role[]>([]);
const loadingRoles = ref(false);

const userId = ref<number>(parseInt(route.params.id as string, 10));

const formData = ref<UpdateUserDto & { id: number }>({
  id: userId.value,
  empresaId: 1,
  roleId: 1,
  name: '',
  email: '',
  phone: '',
  password: '',
  active: true
});

const passwordConfirm = ref('');
const changePassword = ref(false);

// Computed para mostrar el nombre de la empresa
const empresaDisplay = computed(() => {
  return `Empresa ${formData.value.empresaId}`;
});

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

const loadUserData = async () => {
  try {
    loadingData.value = true;
    const user = await userService.getById(userId.value);

    formData.value = {
      id: userId.value,
      empresaId: (user as any).empresa_id || 1,
      roleId: (user as any).role_id || user.role_id || 1,
      name: (user as any).user_name || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      active: user.active ?? true
    };

    // Cargar roles después de tener la empresa
    await loadRoles();
  } catch (error) {
    console.error('Error al cargar usuario:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos del usuario'
    });
    router.push('/users');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.email) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios'
    });
    return;
  }

  if (changePassword.value) {
    if (!formData.value.password) {
      $q.notify({
        type: 'warning',
        message: 'Por favor ingrese la nueva contraseña'
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
  }

  try {
    loading.value = true;

    const updateData: UpdateUserDto = {
      empresaId: formData.value.empresaId,
      roleId: formData.value.roleId,
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      active: formData.value.active,
      usuario: authStore.user?.email || ''
    };

    if (changePassword.value && formData.value.password) {
      updateData.password = formData.value.password;
    }

    await userService.update(userId.value, updateData);
    $q.notify({
      type: 'positive',
      message: 'Usuario actualizado exitosamente'
    });
    router.push('/users');
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el usuario';
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

onMounted(() => {
  loadUserData();
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
          <q-icon name="person" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Usuario</h1>
            <p class="form-subtitle">Modifique la información del usuario</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card v-if="loadingData" flat class="form-card">
        <q-card-section class="loading-section">
          <q-spinner color="primary" size="3em" />
          <div class="loading-text">Cargando datos del usuario...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card v-else flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Personal -->
          <div class="form-section">
            

            <div class="row q-col-gutter-md">
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

            <div class="row q-col-gutter-md">
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

          <!-- Sección: Seguridad -->
          <div class="form-section">
            

            <div class="row">
              <div class="col-12">
                <div class="input-wrapper">
                  <q-checkbox
                    v-model="changePassword"
                    label="Cambiar contraseña del usuario"
                    color="primary"
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div v-if="changePassword" class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Nueva Contraseña <span class="required">*</span></label>
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
            

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Empresa</label>
                  <q-input
                    :model-value="empresaDisplay"
                    placeholder="Empresa asignada"
                    outlined
                    readonly
                    disable
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" />
                    </template>
                  </q-input>
                  <div class="field-hint">
                    La empresa no puede ser modificada
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
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
                    :loading="loadingRoles"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    placeholder="Seleccione un rol"
                  >
                    <template v-slot:prepend>
                      <q-icon name="assignment_ind" color="grey-6" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay roles disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
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
              class="action-btn cancel-btn"
              @click="handleCancel"
              :disable="loading"
              icon="close"
            />
            <q-btn
              unelevated
              label="Actualizar Usuario"
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
  top: 4px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
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
  padding: 20px 32px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.form-section {
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 12px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #2d3748;
}

.input-wrapper {
  margin-bottom: 4px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.required {
  color: #e53e3e;
  font-weight: 600;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    height: 40px;
    min-height: 40px;
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
    font-size: 14px;
    color: #2d3748;
    font-weight: 500;
  }

  :deep(.q-field__prepend) {
    padding-right: 10px;
  }
}

.toggle-wrapper {
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.toggle-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #718096;
  font-style: italic;
}

.field-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #718096;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
}

.action-btn {
  min-width: 140px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.3px;
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { userService } from '../services/api/user.service';
import type { UpdateUserDto } from '../types/user';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingData = ref(true);

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
      active: formData.value.active
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
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">Editar Usuario</div>

      <q-card v-if="!loadingData">
        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- Fila 1: Empresa ID, Role ID -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.empresaId"
                  label="ID Empresa *"
                  type="number"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.roleId"
                  label="ID Rol *"
                  type="number"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
            </div>

            <!-- Fila 2: Nombre -->
            <div class="row">
              <div class="col-12">
                <q-input
                  v-model="formData.name"
                  label="Nombre Completo *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
            </div>

            <!-- Fila 3: Email, Teléfono -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.email"
                  label="Email *"
                  type="email"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'Campo requerido',
                    val => /.+@.+\..+/.test(val) || 'Email inválido'
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.phone"
                  label="Teléfono"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Checkbox para cambiar contraseña -->
            <div class="row">
              <div class="col-12">
                <q-checkbox
                  v-model="changePassword"
                  label="Cambiar contraseña"
                />
              </div>
            </div>

            <!-- Fila 4: Contraseña, Confirmar Contraseña (solo si changePassword es true) -->
            <div v-if="changePassword" class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.password"
                  label="Nueva Contraseña *"
                  type="password"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'Campo requerido',
                    val => val.length >= 6 || 'Mínimo 6 caracteres'
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="passwordConfirm"
                  label="Confirmar Contraseña *"
                  type="password"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'Campo requerido',
                    val => val === formData.password || 'Las contraseñas no coinciden'
                  ]"
                />
              </div>
            </div>

            <!-- Fila 5: Estado -->
            <div class="row">
              <div class="col-12">
                <q-toggle
                  v-model="formData.active"
                  label="Usuario Activo"
                  color="positive"
                />
              </div>
            </div>

            <!-- Botones -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-btn
                  label="Cancelar"
                  color="grey"
                  class="full-width"
                  @click="handleCancel"
                  :disable="loading"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-btn
                  label="Actualizar"
                  type="submit"
                  color="primary"
                  class="full-width"
                  :loading="loading"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card v-else>
        <q-card-section class="text-center">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md">Cargando datos del usuario...</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>

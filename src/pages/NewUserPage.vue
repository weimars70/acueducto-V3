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
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">Nuevo Usuario</div>

      <q-card>
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

            <!-- Fila 4: Contraseña, Confirmar Contraseña -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.password"
                  label="Contraseña *"
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
                  label="Guardar"
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
    </div>
  </q-page>
</template>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>

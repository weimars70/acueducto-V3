<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const isPwd = ref(true);

async function handleLogin() {
  if (!email.value || !password.value) {
    $q.notify({
      color: 'negative',
      message: 'Por favor complete todos los campos',
      icon: 'warning'
    });
    return;
  }

  try {
    loading.value = true;
    console.log('=== INICIANDO LOGIN ===');
    console.log('Email:', email.value);

    const success = await authStore.login({
      email: email.value,
      password: password.value
    });

    console.log('Login success:', success);
    console.log('Auth store state:', { user: authStore.user, token: authStore.token });

    if (success) {
      console.log('✓ Login exitoso, mostrando notificación');
      $q.notify({
        color: 'positive',
        message: 'Inicio de sesión exitoso',
        icon: 'check'
      });

      console.log('Redirigiendo a dashboard...');
      await router.push('/dashboard');
      console.log('✓ Redirección completada');
    } else {
      console.log('✗ Login falló - credenciales inválidas');
      $q.notify({
        color: 'negative',
        message: 'Credenciales inválidas',
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('❌ ERROR EN LOGIN:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    $q.notify({
      color: 'negative',
      message: 'Ocurrió un error durante el inicio de sesión',
      icon: 'error'
    });
  } finally {
    loading.value = false;
    console.log('=== FIN LOGIN ===');
  }
}
</script>

<template>
  <q-page padding class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <h4 class="text-h4 q-mb-md">Login</h4>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !!val || 'Email es requerido']"
            autocomplete="email"
            inputmode="email"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Password"
            outlined
            :type="isPwd ? 'password' : 'text'"
            :rules="[val => !!val || 'Password is required']"
            autocomplete="current-password"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Login"
            :loading="loading"
            class="full-width q-mt-md"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 10px;
}

.q-page {
  min-height: 100vh !important;
}
</style>
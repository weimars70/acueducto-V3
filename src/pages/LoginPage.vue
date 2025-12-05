<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { authService } from '../services/api/auth.service';
import type { UserEmpresa } from '../types/empresa';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const selectedEmpresa = ref<number | null>(null);
const companies = ref<UserEmpresa[]>([]);
const loading = ref(false);
const loadingCompanies = ref(false);
const isPwd = ref(true);

// Watch email changes to load companies
watch(email, async (newEmail) => {
  if (newEmail && newEmail.includes('@') && newEmail.length > 5) {
    try {
      loadingCompanies.value = true;
      companies.value = await authService.getCompaniesByEmail(newEmail);
      
      // Si solo hay una empresa, seleccionarla automáticamente
      if (companies.value.length === 1) {
        selectedEmpresa.value = companies.value[0].empresaId;
      } else {
        selectedEmpresa.value = null;
      }
    } catch (error) {
      console.error('Error al buscar empresas:', error);
      companies.value = [];
      selectedEmpresa.value = null;
    } finally {
      loadingCompanies.value = false;
    }
  } else {
    companies.value = [];
    selectedEmpresa.value = null;
  }
});

async function handleLogin() {
  if (!email.value || !password.value || !selectedEmpresa.value) {
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
    console.log('EmpresaId:', selectedEmpresa.value);

    const success = await authStore.login({
      email: email.value,
      password: password.value,
      empresaId: selectedEmpresa.value
    });

    console.log('Login success:', success);

    if (success) {
      console.log('✓ Login exitoso');
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
      message: error instanceof Error ? error.message : 'Ocurrió un error durante el inicio de sesión',
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

          <q-select
            v-model="selectedEmpresa"
            :options="companies"
            option-value="empresaId"
            option-label="empresa"
            emit-value
            map-options
            label="Empresa"
            outlined
            :rules="[val => val !== null || 'Seleccione una empresa']"
            :loading="loadingCompanies"
            :disable="companies.length === 0"
            :hint="companies.length === 0 ? 'Ingrese un email para ver empresas disponibles' : ''"
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No hay empresas disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>

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
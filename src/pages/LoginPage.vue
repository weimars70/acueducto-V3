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
  <q-page class="login-page">
    <div class="login-container">
      <!-- Fondo decorativo -->
      <div class="background-decoration">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <!-- Contenedor del formulario -->
      <div class="form-wrapper">
        <q-card class="login-card">
          <!-- Header con logo -->
          <div class="login-header">
            <div class="logo-container">
              <q-icon name="water_drop" size="56px" class="logo-icon" />
            </div>
            <h1 class="app-title">Sistema ERP</h1>
            <p class="app-subtitle">Gestión de Acueducto</p>
          </div>

          <!-- Formulario -->
          <q-card-section class="form-section">
            <q-form @submit.prevent="handleLogin" class="login-form">
              <!-- Email Input -->
              <div class="input-group">
                <label class="input-label">Correo Electrónico</label>
                <q-input
                  v-model="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  outlined
                  :rules="[val => !!val || 'Email es requerido']"
                  autocomplete="email"
                  inputmode="email"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Empresa Select -->
              <div class="input-group">
                <label class="input-label">Empresa</label>
                <q-select
                  v-model="selectedEmpresa"
                  :options="companies"
                  option-value="empresaId"
                  option-label="empresa"
                  emit-value
                  map-options
                  placeholder="Seleccione una empresa"
                  outlined
                  :rules="[val => val !== null || 'Seleccione una empresa']"
                  :loading="loadingCompanies"
                  :disable="companies.length === 0"
                  :hint="companies.length === 0 ? 'Ingrese un email válido para ver empresas' : ''"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" color="primary" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey-6">
                        <div class="text-center">
                          <q-icon name="business_center" size="32px" class="q-mb-sm" />
                          <div>No hay empresas disponibles</div>
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Password Input -->
              <div class="input-group">
                <label class="input-label">Contraseña</label>
                <q-input
                  v-model="password"
                  placeholder="Ingrese su contraseña"
                  outlined
                  :type="isPwd ? 'password' : 'text'"
                  :rules="[val => !!val || 'Contraseña es requerida']"
                  autocomplete="current-password"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer toggle-password"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Submit Button -->
              <q-btn
                type="submit"
                unelevated
                label="Iniciar Sesión"
                :loading="loading"
                class="login-btn"
                icon-right="arrow_forward"
              >
                <template v-slot:loading>
                  <q-spinner-dots />
                </template>
              </q-btn>
            </q-form>
          </q-card-section>

          <!-- Footer -->
          <div class="login-footer">
            <div class="footer-text">
              Sistema de Gestión de Acueducto v2.0
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;

  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s infinite ease-in-out;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    bottom: -80px;
    right: -80px;
    animation-delay: 4s;
  }

  .shape-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    right: 10%;
    animation-delay: 2s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-wrapper {
  perspective: 1000px;
}

.login-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
  }
}

.login-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: rotate 30s linear infinite;
  }

  .logo-container {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;

    .logo-icon {
      color: white;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .app-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .app-subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
    position: relative;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.form-section {
  padding: 40px 30px 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  .input-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.3px;
  }

  .modern-input {
    :deep(.q-field__control) {
      height: 48px;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #1976d2;
      }
    }

    :deep(.q-field--focused .q-field__control) {
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }

    :deep(.q-field__prepend) {
      padding-right: 12px;
    }
  }

  .toggle-password {
    color: #9ca3af;
    transition: color 0.3s ease;

    &:hover {
      color: #1976d2;
    }
  }
}

.login-btn {
  margin-top: 8px;
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(25, 118, 210, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  padding: 20px 30px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: center;

  .footer-text {
    font-size: 12px;
    color: #6b7280;
    letter-spacing: 0.3px;
  }
}

// Responsive
@media (max-width: 600px) {
  .login-page {
    padding: 16px;
  }

  .login-header {
    padding: 32px 24px;

    .logo-icon {
      font-size: 48px;
    }

    .app-title {
      font-size: 28px;
    }

    .app-subtitle {
      font-size: 13px;
    }
  }

  .form-section {
    padding: 32px 24px 24px;
  }

  .login-form {
    gap: 20px;
  }

  .login-btn {
    height: 48px;
    font-size: 15px;
  }

  .background-decoration {
    .shape-1 {
      width: 300px;
      height: 300px;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
    }

    .shape-3 {
      display: none;
    }
  }
}

@media (max-width: 400px) {
  .login-header {
    padding: 24px 16px;

    .app-title {
      font-size: 24px;
    }
  }

  .form-section {
    padding: 24px 16px;
  }

  .login-footer {
    padding: 16px;

    .footer-text {
      font-size: 11px;
    }
  }
}
</style>
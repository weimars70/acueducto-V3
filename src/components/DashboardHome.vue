<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const sessionData = computed(() => {
  return {
    user: authStore.user,
    token: authStore.token ? `${authStore.token.substring(0, 20)}...` : null,
    isAuthenticated: authStore.isAuthenticated
  };
});

const localStorageData = computed(() => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      token: token ? `${token.substring(0, 20)}...` : null,
      user: user
    };
  } catch (e) {
    return { error: 'Error al leer localStorage' };
  }
});
</script>

<template>
  <q-page class="q-pa-md">
    <q-card class="my-card q-mb-md">
      <q-card-section>
        <div class="text-h6">Bienvenido!</div>
        <div class="text-subtitle2">Sesión activa</div>
      </q-card-section>

      <q-card-section>
        <p>Use el menú lateral para navegar por las diferentes secciones.</p>
      </q-card-section>
    </q-card>

    <!-- Variables de Sesión -->
    <q-card class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="account_circle" class="q-mr-sm" />
          Variables de Sesión
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-h6 q-mb-md">Pinia Store (authStore)</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label overline>Usuario ID</q-item-label>
              <q-item-label>{{ sessionData.user?.id || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Nombre</q-item-label>
              <q-item-label>{{ sessionData.user?.name || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Email</q-item-label>
              <q-item-label>{{ sessionData.user?.email || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Username</q-item-label>
              <q-item-label>{{ sessionData.user?.username || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Empresa ID</q-item-label>
              <q-item-label class="text-bold text-primary">
                {{ sessionData.user?.empresaId || 'N/A' }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Role</q-item-label>
              <q-item-label>{{ sessionData.user?.role || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Token (primeros 20 caracteres)</q-item-label>
              <q-item-label class="text-grey-7">{{ sessionData.token || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Autenticado</q-item-label>
              <q-item-label>
                <q-badge :color="sessionData.isAuthenticated ? 'positive' : 'negative'">
                  {{ sessionData.isAuthenticated ? 'Sí' : 'No' }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-h6 q-mb-md">LocalStorage</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label overline>Token</q-item-label>
              <q-item-label class="text-grey-7">{{ localStorageData.token || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Usuario (JSON completo)</q-item-label>
              <q-item-label class="text-grey-7">
                <pre class="q-ma-none">{{ JSON.stringify(localStorageData.user, null, 2) }}</pre>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section class="bg-grey-2">
        <div class="text-caption text-grey-7">
          <q-icon name="info" class="q-mr-xs" />
          Estas variables se envían automáticamente en cada petición al backend mediante el interceptor de Axios.
          El campo <strong>empresaId</strong> se usa para filtrar todos los datos por empresa.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
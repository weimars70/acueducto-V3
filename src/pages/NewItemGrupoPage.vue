<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { itemsGruposService } from '../services/api/item-grupo.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  nombre: '',
});

const saving = ref(false);

const handleSubmit = async () => {
  try {
    if (!form.value.nombre) {
      $q.notify({
        type: 'warning',
        message: 'Por favor complete los campos requeridos'
      });
      return;
    }

    saving.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    
    await itemsGruposService.create({
      nombre: form.value.nombre,
      empresa_id: empresaId,
      usuario: authStore.user?.email
    });

    $q.notify({
      type: 'positive',
      message: 'Grupo creado exitosamente'
    });

    router.push('/items-grupos');
  } catch (error) {
    console.error('Error al crear grupo:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear el grupo'
    });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <q-page class="page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="primary"
              class="q-mr-md"
              @click="router.back()"
            />
            <div>
              <h1 class="page-title">Nuevo Grupo</h1>
              <p class="page-subtitle">Crear un nuevo grupo de items</p>
            </div>
          </div>
        </div>
      </div>

      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nombre"
                label="Nombre del Grupo *"
                outlined
                :rules="[val => !!val || 'El nombre es obligatorio']"
              />
            </div>
          </div>

          <div class="row justify-end q-mt-lg form-actions">
            <q-btn
              label="Cancelar"
              outline
              color="grey-7"
              class="action-btn cancel-btn"
              @click="router.back()"
              icon="close"
            />
            <q-btn
              type="submit"
              label="Guardar Grupo"
              color="primary"
              unelevated
              :loading="saving"
              class="action-btn save-btn"
              icon="save"
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
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

</style>

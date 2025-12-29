<script setup lang="ts">
import type { Consumption } from '../types/consumption';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  items: Consumption[]
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(value);
};

const handleEdit = (consumption: Consumption) => {
  router.push({
    name: 'edit-consumption',
    params: {
      id: consumption.codigo.toString(),
      consumption: JSON.stringify(consumption)
    }
  });
};
</script>

<template>
  <div class="row q-col-gutter-md">
    <div v-for="item in items" :key="item.codigo" class="col-12 col-sm-6 col-md-4">
      <q-card class="consumption-card">
        <!-- Encabezado con gradiente -->
        <q-card-section class="card-header q-pa-md">
          <div class="row items-start justify-between no-wrap">
            <div class="col">
              <div class="customer-name">{{ item.nombre }}</div>
              <div class="row items-center q-gutter-x-xs q-mt-xs">
                <q-badge color="white" text-color="primary" class="info-badge">
                  <q-icon name="tag" size="14px" class="q-mr-xs" />
                  {{ item.codigo }}
                </q-badge>
                <q-badge color="white" text-color="primary" class="info-badge">
                  <q-icon name="home" size="14px" class="q-mr-xs" />
                  {{ item.instalacion }}
                </q-badge>
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="white"
                size="sm"
                class="edit-btn"
                @click="handleEdit(item)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <!-- Información principal -->
        <q-card-section class="card-body q-pa-md">
          <!-- Info rápida -->
          <div class="quick-info q-mb-md">
            <div class="info-item">
              <q-icon name="location_on" color="primary" size="16px" />
              <span class="info-text">{{ item.direccion }}</span>
            </div>
            <div class="info-item">
              <q-icon name="event" color="primary" size="16px" />
              <span class="info-text">{{ item.mes }} {{ item.year }}</span>
            </div>
            <div class="info-item">
              <q-chip
                :color="item.facturado ? 'positive' : 'orange'"
                text-color="white"
                dense
                size="sm"
                :icon="item.facturado ? 'check_circle' : 'pending'"
              >
                {{ item.facturado ? 'Facturado' : 'Pendiente' }}
              </q-chip>
            </div>
          </div>

          <!-- Lecturas destacadas -->
          <div class="readings-section">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <div class="reading-card reading-card-medidor">
                  <q-icon name="speed" size="20px" class="reading-icon" />
                  <div class="reading-label">Medidor</div>
                  <div class="reading-value">{{ item.medidor }}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="reading-card reading-card-lectura">
                  <q-icon name="visibility" size="20px" class="reading-icon" />
                  <div class="reading-label">Lectura</div>
                  <div class="reading-value">{{ item.lectura }}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="reading-card reading-card-consumo">
                  <q-icon name="water_drop" size="20px" class="reading-icon" />
                  <div class="reading-label">Consumo</div>
                  <div class="reading-value">{{ item.consumo }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cobros Adicionales -->
          <div v-if="item.otros_cobros || item.reconexion" class="additional-charges q-mt-md">
            <div class="charges-header">
              <q-icon name="attach_money" size="16px" color="grey-7" />
              <span class="charges-title">Cobros Adicionales</span>
            </div>
            <div class="row q-col-gutter-xs q-mt-xs">
              <div v-if="item.otros_cobros" class="col-6">
                <div class="charge-item">
                  <div class="charge-label">Otros</div>
                  <div class="charge-value">{{ formatCurrency(item.otros_cobros) }}</div>
                </div>
              </div>
              <div v-if="item.reconexion" class="col-6">
                <div class="charge-item">
                  <div class="charge-label">Reconexión</div>
                  <div class="charge-value">{{ formatCurrency(item.reconexion) }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consumption-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;

  .customer-name {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .info-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .edit-btn {
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }
  }
}

.card-body {
  background: #fafbfc;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .info-text {
      font-size: 13px;
      color: #5f6368;
      line-height: 1.4;
    }
  }
}

.readings-section {
  .reading-card {
    background: white;
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    .reading-icon {
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .reading-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      opacity: 0.7;
    }

    .reading-value {
      font-size: 16px;
      font-weight: 700;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .reading-card-medidor {
    border-color: #e3f2fd;

    .reading-icon, .reading-label {
      color: #1976d2;
    }

    .reading-value {
      color: #1565c0;
    }
  }

  .reading-card-lectura {
    border-color: #f3e5f5;

    .reading-icon, .reading-label {
      color: #7b1fa2;
    }

    .reading-value {
      color: #6a1b9a;
    }
  }

  .reading-card-consumo {
    border-color: #e8f5e9;

    .reading-icon, .reading-label {
      color: #2e7d32;
    }

    .reading-value {
      color: #1b5e20;
    }
  }
}

.additional-charges {
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;

  .charges-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;

    .charges-title {
      font-size: 12px;
      font-weight: 600;
      color: #5f6368;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .charge-item {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 8px;

    .charge-label {
      font-size: 10px;
      font-weight: 600;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .charge-value {
      font-size: 13px;
      font-weight: 700;
      color: #424242;
    }
  }
}

// Mobile optimizations
@media (max-width: 599px) {
  .card-header {
    .customer-name {
      font-size: 15px;
    }

    .info-badge {
      font-size: 10px;
      padding: 3px 6px;
    }
  }

  .quick-info {
    gap: 6px;

    .info-text {
      font-size: 12px;
    }
  }

  .reading-card {
    padding: 10px 6px;

    .reading-icon {
      font-size: 18px !important;
    }

    .reading-label {
      font-size: 9px;
    }

    .reading-value {
      font-size: 15px;
    }
  }

  .additional-charges {
    padding: 10px;

    .charge-item {
      padding: 6px;

      .charge-value {
        font-size: 12px;
      }
    }
  }
}
</style>
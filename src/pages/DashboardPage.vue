<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import MainDrawer from '../components/MainDrawer.vue';
import TabsBar from '../components/TabsBar.vue';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const leftDrawerOpen = ref(true);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="elegant-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="menu-btn"
        />

        <q-toolbar-title class="row no-wrap items-center q-ml-md">
          <div class="toolbar-info-container">
            <div class="empresa-info row items-center no-wrap">
              <q-icon name="business" size="22px" class="q-mr-xs" />
              <span class="empresa-nombre">{{ authStore.user?.empresa?.nombre || 'Sistema ERP' }}</span>
            </div>
            <div class="user-info row items-center no-wrap">
              <q-icon name="person" size="16px" class="q-mr-xs" />
              <span class="user-nombre">{{ authStore.user?.name || 'N/A' }}</span>
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          round
          dense
          icon="logout"
          @click="handleLogout"
          class="logout-btn"
        >
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
            Cerrar sesión
          </q-tooltip>
        </q-btn>
      </q-toolbar>
      <TabsBar />
    </q-header>

    <MainDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.elegant-toolbar {
  height: 70px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0 20px;
}

.menu-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: rotate(90deg);
  }
}

.toolbar-info-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empresa-info {
  .q-icon {
    opacity: 0.95;
  }

  .empresa-nombre {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.user-info {
  opacity: 0.9;

  .q-icon {
    opacity: 0.8;
  }

  .user-nombre {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }
}

.logout-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: scale(1.1);
  }
}

// Responsive
@media (max-width: 600px) {
  .elegant-toolbar {
    height: 64px;
    padding: 0 12px;
  }

  .empresa-info .empresa-nombre {
    font-size: 16px;
  }

  .user-info .user-nombre {
    font-size: 12px;
  }
}

@media (max-width: 400px) {
  .empresa-info .empresa-nombre {
    font-size: 14px;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-info {
    .q-icon {
      display: none;
    }

    .user-nombre {
      font-size: 11px;
    }
  }
}
</style>
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '../stores/tabs';

const router = useRouter();
const tabsStore = useTabsStore();

const tabs = computed(() => tabsStore.tabs);
const activeTab = computed(() => tabsStore.activeTab);

const handleTabClick = (route: string) => {
  tabsStore.setActiveTab(route);
  router.push(route);
};

const handleTabClose = (route: string) => {
  tabsStore.removeTab(route);
  if (tabs.value.length > 0) {
    router.push(tabs.value[tabs.value.length - 1].route);
  } else {
    router.push('/dashboard');
  }
};
</script>

<template>
  <q-tabs
    v-model="activeTab"
    dense
    class="elegant-tabs"
    active-color="primary"
    indicator-color="primary"
    align="left"
    narrow-indicator
  >
    <q-tab
      v-for="tab in tabs"
      :key="tab.route"
      :name="tab.route"
      class="elegant-tab"
      @click="handleTabClick(tab.route)"
    >
      <template v-slot:default>
        <div class="tab-content row items-center no-wrap">
          <q-icon :name="tab.icon" size="17px" class="tab-icon" />
          <div class="tab-label">{{ tab.name }}</div>
          <q-btn
            v-if="tab.closable"
            flat
            dense
            round
            size="xs"
            icon="close"
            class="tab-close-btn"
            @click.stop="handleTabClose(tab.route)"
          >
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
              Cerrar pestaña
            </q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-tab>
  </q-tabs>
</template>

<style lang="scss" scoped>
.elegant-tabs {
  min-height: 40px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  border-bottom: 2px solid #e3e8ef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #1976d2 0%, #1565c0 100%);
    opacity: 0.15;
  }
}

.elegant-tab {
  min-height: 40px;
  padding: 0 12px;
  color: #5f6368;
  font-weight: 500;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: auto;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1976d2 0%, #1565c0 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tab-content {
    gap: 6px;
    position: relative;
    z-index: 1;
  }

  .tab-icon {
    color: #5f6368;
    transition: all 0.3s ease;
  }

  .tab-label {
    font-size: 13px;
    white-space: nowrap;
    font-weight: 500;
    letter-spacing: 0.2px;
    transition: all 0.3s ease;
  }

  .tab-close-btn {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-left: 2px;
    color: #5f6368;

    &:hover {
      background: rgba(244, 67, 54, 0.15);
      color: #f44336;
      transform: scale(1);
    }
  }

  &:hover {
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%);
    color: #1976d2;

    .tab-icon {
      color: #1976d2;
      transform: scale(1.1);
    }

    .tab-label {
      color: #1976d2;
    }

    .tab-close-btn {
      opacity: 0.7;
      transform: scale(1);
    }
  }

  &.q-tab--active {
    color: #1976d2;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 0 -2px 8px rgba(25, 118, 210, 0.1);

    &::before {
      transform: scaleX(1);
    }

    .tab-icon {
      color: #1976d2;
      transform: scale(1.15);
      filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3));
    }

    .tab-label {
      color: #1976d2;
      font-weight: 600;
    }

    .tab-close-btn {
      opacity: 1;
      transform: scale(1);
      color: #1976d2;

      &:hover {
        background: rgba(244, 67, 54, 0.15);
        color: #f44336;
      }
    }

    &:hover {
      background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .elegant-tabs {
    min-height: 36px;
  }

  .elegant-tab {
    min-height: 36px;
    padding: 0 10px;

    .tab-label {
      font-size: 12px;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-icon {
      font-size: 15px;
    }
  }
}

@media (max-width: 480px) {
  .elegant-tab {
    padding: 0 8px;

    .tab-label {
      max-width: 60px;
    }

    .tab-close-btn {
      opacity: 0.6;
    }
  }
}

// Animaciones para cuando se agregan/quitan tabs
:deep(.q-tab) {
  animation: tabSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tabSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Scrollbar para tabs si hay muchos
:deep(.q-tabs__content) {
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(25, 118, 210, 0.3);
    border-radius: 2px;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(25, 118, 210, 0.5);
    }
  }
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import YearSelect from './YearSelect.vue';
import MonthSelect from './MonthSelect.vue';
import SearchInput from './SearchInput.vue';
import InstallationInput from './InstallationInput.vue';

// Obtener año y mes actuales
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12

const filters = ref({
  year: currentYear as number | null,
  mes_codigo: currentMonth as number | null,
  nombre: '' as string,
  instalacion: null as number | null
});

const emit = defineEmits<{
  (e: 'filter', filters: typeof filters.value): void
}>();

const applyFilters = () => {
  emit('filter', filters.value);
};

const clearFilters = () => {
  filters.value = {
    year: currentYear,
    mes_codigo: currentMonth,
    nombre: '',
    instalacion: null
  };
  emit('filter', filters.value);
};

// Aplicar filtros automáticamente al montar el componente
onMounted(() => {
  applyFilters();
});
</script>

<template>
  <div class="filters-container">
    <div class="filters-row">
      <div class="date-filters">
        <YearSelect v-model="filters.year" class="year-select" />
        <MonthSelect v-model="filters.mes_codigo" class="month-select" />
      </div>

      <div class="search-filters">
        <SearchInput v-model="filters.nombre" class="search-input" />
        <InstallationInput v-model="filters.instalacion" class="installation-input" />
      </div>

      <div class="filter-actions">
        <q-btn
          flat
          dense
          round
          color="negative"
          icon="close"
          size="sm"
          @click="clearFilters"
        >
          <q-tooltip>Limpiar filtros</q-tooltip>
        </q-btn>
        <q-btn
          dense
          unelevated
          color="primary"
          icon="filter_alt"
          label="Filtrar"
          size="sm"
          class="filter-btn"
          @click="applyFilters"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters-container {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-filters {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.search-filters {
  display: flex;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.year-select {
  width: 100px;
}

.month-select {
  width: 130px;
}

.search-input,
.installation-input {
  flex: 1;
  min-width: 120px;
}

.filter-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  .filter-btn {
    border-radius: 8px;
    padding: 0 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }
  }
}

// Mobile layout
@media (max-width: 768px) {
  .filters-container {
    padding: 10px;
  }

  .filters-row {
    gap: 6px;
  }

  .date-filters {
    width: 100%;
    justify-content: space-between;
  }

  .year-select {
    flex: 1;
  }

  .month-select {
    flex: 1;
  }

  .search-filters {
    width: 100%;
    min-width: auto;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 4px;

    .filter-btn {
      flex: 1;
      max-width: 120px;
    }
  }
}

// Extra small mobile
@media (max-width: 450px) {
  .search-filters {
    flex-direction: column;

    .search-input,
    .installation-input {
      width: 100%;
    }
  }

  .filter-actions {
    .filter-btn {
      max-width: none;
    }
  }
}
</style>
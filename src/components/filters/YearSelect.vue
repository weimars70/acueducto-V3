<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number | null
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>();

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11

const years = computed(() => {
  const result = [];

  // Si el mes actual es diciembre (12), incluir el año siguiente
  const maxYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  for (let i = maxYear; i >= currentYear - 5; i--) {
    result.push(i);
  }
  return result;
});
</script>

<template>
  <q-select
    :model-value="modelValue"
    :options="years"
    label="Año"
    outlined
    dense
    emit-value
    map-options
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
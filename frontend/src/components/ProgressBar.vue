<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <span class="text-gray-400 text-xs font-medium">Course Progress</span>
      <span class="text-gray-300 text-xs font-semibold">{{ value }}% Complete</span>
    </div>
    <div class="w-full h-[4px] bg-slate-700/60 rounded-full overflow-hidden">
      <div class="h-full rounded-full transition-all duration-500 ease-out" :style="fillStyle" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
})

const fillStyle = computed(() => ({
  width: props.value + '%',
  // Degradado lineal: empieza en azul vibrante, pasa por azul claro y termina en blanco
  background: 'linear-gradient(to right, #3b82f6 0%, #93c5fd 80%, #ffffff 100%)',
}))
</script>

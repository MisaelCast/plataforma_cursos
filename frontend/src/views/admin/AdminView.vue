<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
    <p class="text-gray-500 text-sm mb-8">Bienvenido, {{ authStore.userName }}</p>

    <!-- Accesos rápidos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <router-link
        to="/admin/cursos"
        class="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
      >
        <div class="text-2xl mb-2">📚</div>
        <h2 class="font-semibold text-gray-900">Cursos</h2>
        <p class="text-gray-400 text-sm mt-1">Crear y gestionar cursos</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
const authStore = useAuthStore()
</script>
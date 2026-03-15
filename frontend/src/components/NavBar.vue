<template>
  <nav class="bg-gray-900 border-b border-gray-800 px-6 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">

      <!-- Logo / Nombre de la plataforma -->
      <router-link to="/" class="flex items-center gap-2">
        <span class="text-white font-bold text-xl tracking-tight">
          Plataforma<span class="text-indigo-400">Cursos</span>
        </span>
      </router-link>

      <!-- Links de navegación (centro) -->
      <div class="hidden md:flex items-center gap-6">
        <router-link
          to="/"
          class="text-gray-400 hover:text-white text-sm transition-colors"
          active-class="text-white font-medium"
        >
          Catálogo
        </router-link>

        <!-- Solo visible para admins -->
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="text-gray-400 hover:text-white text-sm transition-colors"
          active-class="text-white font-medium"
        >
          Admin
        </router-link>
      </div>

      <!-- Usuario y logout (derecha) -->
      <div class="flex items-center gap-3">

        <!-- Avatar del usuario -->
        <img
          v-if="authStore.userAvatar"
          :src="authStore.userAvatar"
          :alt="authStore.userName"
          class="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold"
        >
          {{ authStore.userName.charAt(0) }}
        </div>

        <!-- Nombre del usuario -->
        <span class="text-gray-300 text-sm hidden md:block">
          {{ authStore.userName }}
        </span>

        <!-- Botón de logout — .stop evita que el click se propague al router-link padre -->
        <button
          @click.stop="handleLogout"
          class="text-gray-400 hover:text-red-400 text-sm transition-colors ml-2 cursor-pointer"
        >
          Salir
        </button>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Cierra la sesión y redirige al login
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>   
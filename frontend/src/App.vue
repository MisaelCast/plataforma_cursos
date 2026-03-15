<template>
  <div>
    <!-- Navbar visible solo para usuarios autenticados -->
    <NavBar v-if="authStore.isAuthenticated" />

    <!-- Contenido de cada página -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>
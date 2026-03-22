<template>
  <div>
    <NavBar v-if="authStore.isAuthenticated && !isLearnRoute" />
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const isLearnRoute = computed(() => route.name === 'aprender')
</script>

<template>
  <div>
    <h1>Panel de Administración</h1>
    <p>Bienvenido, {{ authStore.userName }}</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
</script>
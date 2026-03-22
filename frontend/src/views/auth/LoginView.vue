<template>
  <div>
    <h1>Bienvenido</h1>
    <button @click="loginConGoogle">Iniciar sesión con Google</button>
  </div>
</template>

<script setup>
import { supabase } from '@/services/supabase'

async function loginConGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account', // siempre muestra el selector de cuenta
      },
    },
  })
  if (error) console.error(error.message)
}
</script>

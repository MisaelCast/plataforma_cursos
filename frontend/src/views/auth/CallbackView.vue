<template>
  <div>
    <p>Cargando...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if (data?.session) {
    router.push('/')
  } else {
    // Espera a que Supabase procese el token del hash
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/')
      } else {
        router.push('/login')
      }
    })
  }
})
</script>

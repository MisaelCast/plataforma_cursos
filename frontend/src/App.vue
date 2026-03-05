<template>
  <RouterView />
</template>

<script setup>
import { supabase } from './lib/supabase'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(async () => {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Conexión exitosa:', data)
  }
})
</script>
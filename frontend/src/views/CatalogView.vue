<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <!-- Encabezado -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Catálogo de cursos</h1>
      <p class="text-gray-500 mt-2">Explora todos los cursos disponibles</p>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-20 text-gray-400">Cargando cursos...</div>

    <!-- Sin cursos -->
    <div v-else-if="courses.length === 0" class="text-center py-20">
      <p class="text-gray-400 text-lg">No hay cursos disponibles todavía</p>
    </div>

    <!-- Grid de cursos -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="course in courses"
        :key="course.id"
        :to="`/cursos/${course.slug}`"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group"
      >
        <!-- Thumbnail -->
        <div class="aspect-video bg-gray-100 overflow-hidden">
          <img
            v-if="course.thumbnail_url"
            :src="course.thumbnail_url"
            :alt="course.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300 text-5xl font-bold"
          >
            {{ course.title.charAt(0) }}
          </div>
        </div>

        <!-- Info del curso -->
        <div class="p-5">
          <!-- Nivel y categoría -->
          <div class="flex items-center gap-2 mb-2">
            <span
              v-if="course.level"
              class="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium"
            >
              {{ levelLabel(course.level) }}
            </span>
            <span v-if="course.categories?.name" class="text-xs text-gray-400">
              {{ course.categories.name }}
            </span>
          </div>

          <!-- Título -->
          <h2
            class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug"
          >
            {{ course.title }}
          </h2>

          <!-- Descripción corta -->
          <p v-if="course.short_description" class="text-gray-500 text-sm mt-2 line-clamp-2">
            {{ course.short_description }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const courses = ref([])
const loading = ref(true)

// Carga solo los cursos publicados para el catálogo público
onMounted(async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, categories (id, name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando catálogo:', error.message)
  } else {
    courses.value = data
  }

  loading.value = false
})

// Traduce el nivel a español
function levelLabel(level) {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }
  return labels[level] || level
}
</script>

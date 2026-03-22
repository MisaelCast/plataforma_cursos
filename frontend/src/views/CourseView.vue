<template>
  <div>
    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-20 text-gray-400">Cargando curso...</div>

    <!-- Curso no encontrado -->
    <div v-else-if="!course" class="text-center py-20">
      <p class="text-gray-400 text-lg">Curso no encontrado</p>
      <router-link to="/" class="text-indigo-600 text-sm mt-2 inline-block">
        ← Volver al catálogo
      </router-link>
    </div>

    <div v-else>
      <!-- Hero del curso -->
      <div class="bg-gray-900 text-white">
        <div class="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start">
          <!-- Info -->
          <div class="flex-1">
            <!-- Nivel y categoría -->
            <div class="flex items-center gap-2 mb-3">
              <span v-if="course.level" class="text-xs bg-indigo-600 px-2 py-0.5 rounded-full">
                {{ levelLabel(course.level) }}
              </span>
              <span v-if="course.categories?.name" class="text-gray-400 text-sm">
                {{ course.categories.name }}
              </span>
            </div>

            <h1 class="text-3xl font-bold mb-4">{{ course.title }}</h1>

            <p v-if="course.short_description" class="text-gray-300 text-lg mb-6">
              {{ course.short_description }}
            </p>

            <!-- Botón de inscripción -->
            <div v-if="!isEnrolled">
              <button
                @click="handleEnroll"
                :disabled="enrolling"
                class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-lg transition-colors cursor-pointer"
              >
                {{ enrolling ? 'Inscribiendo...' : 'Inscribirme gratis' }}
              </button>
            </div>

            <!-- Ya inscrito -->
            <div v-else class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <span class="text-green-400 font-medium">✓ Ya estás inscrito</span>
                <router-link
                  :to="`/cursos/${course.slug}/aprender`"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Continuar curso →
                </router-link>
              </div>

              <!-- Barra de progreso -->
              <div v-if="totalLessons > 0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-gray-300 text-sm">Tu progreso</span>
                  <span class="text-gray-300 text-sm font-medium">{{ progressPercent }}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                  <div
                    class="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>
                <p class="text-gray-400 text-xs mt-1">
                  {{ completedCount }} de {{ totalLessons }} lecciones completadas
                </p>
              </div>
            </div>
          </div>

          <!-- Thumbnail -->
          <div class="w-full md:w-80 flex-shrink-0">
            <img
              v-if="course.thumbnail_url"
              :src="course.thumbnail_url"
              :alt="course.title"
              class="w-full rounded-xl object-cover aspect-video"
            />
            <div
              v-else
              class="w-full aspect-video rounded-xl bg-gray-800 flex items-center justify-center text-gray-600 text-6xl font-bold"
            >
              {{ course.title.charAt(0) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido del curso -->
      <div class="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        <!-- Temario -->
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Contenido del curso</h2>

          <!-- Sin secciones -->
          <div v-if="sections.length === 0" class="text-gray-400 text-sm">
            Este curso aún no tiene contenido disponible.
          </div>

          <!-- Secciones -->
          <div class="space-y-3">
            <div
              v-for="section in sections"
              :key="section.id"
              class="border border-gray-200 rounded-xl overflow-hidden"
            >
              <!-- Encabezado sección -->
              <button
                @click="toggleSection(section.id)"
                class="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span class="font-medium text-gray-800">{{ section.title }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-gray-400 text-sm">
                    {{ section.lessons.length }} lecciones
                  </span>
                  <span class="text-gray-400 text-xs">
                    {{ openSections.includes(section.id) ? '▲' : '▼' }}
                  </span>
                </div>
              </button>

              <!-- Lecciones -->
              <div v-if="openSections.includes(section.id)" class="divide-y divide-gray-100">
                <div
                  v-for="lesson in section.lessons"
                  :key="lesson.id"
                  class="flex items-center justify-between px-5 py-3"
                  :class="lesson.is_preview || isEnrolled ? '' : 'opacity-60'"
                >
                  <div class="flex items-center gap-3">
                    <!-- Check si está completada -->
                    <div
                      class="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-xs"
                      :class="
                        completedLessons.includes(lesson.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      "
                    >
                      <span v-if="completedLessons.includes(lesson.id)">✓</span>
                    </div>
                    <span class="text-gray-700 text-sm">{{ lesson.title }}</span>
                    <span
                      v-if="lesson.is_preview"
                      class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                    >
                      Preview
                    </span>
                    <span v-if="lesson.pdf_url" class="text-xs text-orange-400">📄</span>
                  </div>

                  <!-- Acceso según inscripción -->
                  <span v-if="!lesson.is_preview && !isEnrolled" class="text-gray-300 text-xs">
                    🔒
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Descripción completa -->
        <div class="w-full md:w-80 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Acerca de este curso</h2>
          <p
            v-if="course.description"
            class="text-gray-600 text-sm leading-relaxed whitespace-pre-line"
          >
            {{ course.description }}
          </p>
          <p v-else class="text-gray-400 text-sm italic">Sin descripción disponible.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const course = ref(null)
const sections = ref([])
const loading = ref(true)
const isEnrolled = ref(false)
const enrolling = ref(false)
const completedLessons = ref([])

// Secciones abiertas en el acordeón (todas abiertas por defecto)
const openSections = ref([])

// ── Computed de progreso ──

// Total de lecciones del curso
const totalLessons = computed(() => {
  return sections.value.reduce((acc, s) => acc + s.lessons.length, 0)
})

// Lecciones completadas por el usuario
const completedCount = computed(() => {
  return sections.value
    .flatMap((s) => s.lessons)
    .filter((l) => completedLessons.value.includes(l.id)).length
})

// Porcentaje de progreso
const progressPercent = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedCount.value / totalLessons.value) * 100)
})

onMounted(async () => {
  await loadCourse()
})

async function loadCourse() {
  loading.value = true

  // Carga el curso por slug
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*, categories (id, name)')
    .eq('slug', route.params.slug)
    .eq('is_published', true)
    .single()

  if (courseError || !courseData) {
    loading.value = false
    return
  }

  course.value = courseData

  // Carga las secciones con sus lecciones
  const { data: sectionsData } = await supabase
    .from('sections')
    .select('*, lessons (*)')
    .eq('course_id', courseData.id)
    .order('position', { ascending: true })

  if (sectionsData) {
    sections.value = sectionsData.map((s) => ({
      ...s,
      lessons: (s.lessons || []).sort((a, b) => a.position - b.position),
    }))

    // Abre todas las secciones por defecto
    openSections.value = sectionsData.map((s) => s.id)
  }

  // Verifica si el usuario ya está inscrito
  if (authStore.isAuthenticated) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('user_id', authStore.session.user.id)
      .eq('course_id', courseData.id)
      .single()

    isEnrolled.value = !!enrollment

    // Carga el progreso del usuario
    if (isEnrolled.value) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', authStore.session.user.id)
        .eq('completed', true)

      if (progressData) {
        completedLessons.value = progressData.map((p) => p.lesson_id)
      }
    }
  }

  loading.value = false
}

// Abre o cierra una sección en el acordeón
function toggleSection(sectionId) {
  const index = openSections.value.indexOf(sectionId)
  if (index === -1) {
    openSections.value.push(sectionId)
  } else {
    openSections.value.splice(index, 1)
  }
}

// Inscribe al usuario en el curso
async function handleEnroll() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  enrolling.value = true

  const { error } = await supabase.from('enrollments').insert({
    user_id: authStore.session.user.id,
    course_id: course.value.id,
  })

  if (error) {
    console.error('Error al inscribirse:', error.message)
  } else {
    isEnrolled.value = true
  }

  enrolling.value = false
}

function levelLabel(level) {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }
  return labels[level] || level
}
</script>

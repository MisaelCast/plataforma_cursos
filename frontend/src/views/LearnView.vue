<template>
  <div class="h-screen flex flex-col bg-gray-950 overflow-hidden">
    <!-- Barra superior -->
    <div
      class="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0"
    >
      <router-link
        :to="`/cursos/${course?.slug}`"
        class="text-gray-400 hover:text-white text-sm transition-colors"
      >
        ← Volver al curso
      </router-link>
      <h1 class="text-white text-sm font-medium truncate mx-4">
        {{ currentLesson?.title || 'Selecciona una lección' }}
      </h1>
      <div class="flex items-center gap-4">
        <span class="text-gray-400 text-sm">
          {{ completedCount }} / {{ totalLessons }} lecciones
        </span>
        <!-- Botón para mostrar/ocultar el temario -->
        <button
          @click="showSidebar = !showSidebar"
          class="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          {{ showSidebar ? 'Ocultar temario ▶' : '◀ Ver temario' }}
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Panel izquierdo — Video / PDF -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Sin lección seleccionada -->
        <div v-if="!currentLesson" class="flex-1 flex items-center justify-center text-gray-500">
          Selecciona una lección para comenzar
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Reproductor de YouTube -->
          <div v-if="currentLesson.youtube_url" class="flex-1 bg-black">
            <iframe
              :src="youtubeEmbedUrl"
              class="w-full h-full"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
              "
              allowfullscreen
            />
          </div>

          <!-- Sin video — solo PDF -->
          <div v-else-if="currentLesson.pdf_url" class="flex-1 bg-gray-900">
            <iframe
              :src="`https://docs.google.com/viewer?url=${encodeURIComponent(currentLesson.pdf_url)}&embedded=true`"
              class="w-full h-full"
              frameborder="0"
            />
          </div>

          <!-- Sin contenido -->
          <div v-else class="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
            Esta lección no tiene video ni PDF todavía.
          </div>

          <!-- Visor PDF debajo del video si tiene ambos -->
          <div
            v-if="currentLesson.youtube_url && currentLesson.pdf_url"
            class="h-64 bg-gray-900 border-t border-gray-800"
          >
            <iframe
              :src="`https://docs.google.com/viewer?url=${encodeURIComponent(currentLesson.pdf_url)}&embedded=true`"
              class="w-full h-full"
              frameborder="0"
            />
          </div>

          <!-- Barra inferior del reproductor -->
          <div
            class="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0"
          >
            <!-- Info de la lección -->
            <div>
              <p class="text-white text-sm font-medium">{{ currentLesson.title }}</p>
              <div class="flex items-center gap-3 mt-1">
                <a
                  v-if="currentLesson.pdf_url && currentLesson.youtube_url"
                  :href="currentLesson.pdf_url"
                  target="_blank"
                  class="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  📄 Descargar PDF
                </a>
              </div>
            </div>

            <!-- Controles de navegación -->
            <div class="flex items-center gap-3">
              <button
                @click="prevLesson"
                :disabled="!hasPrev"
                class="text-gray-400 hover:text-white disabled:opacity-30 text-sm transition-colors cursor-pointer"
              >
                ← Anterior
              </button>

              <!-- Marcar como completada -->
              <button
                @click="toggleComplete"
                :disabled="completing"
                class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                :class="
                  isCompleted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                "
              >
                {{ isCompleted ? '✓ Completada' : 'Marcar completada' }}
              </button>

              <button
                @click="nextLesson"
                :disabled="!hasNext"
                class="text-gray-400 hover:text-white disabled:opacity-30 text-sm transition-colors cursor-pointer"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho — Temario -->
      <div
        v-show="showSidebar"
        class="w-80 bg-gray-900 border-l border-gray-800 flex flex-col flex-shrink-0 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-gray-800">
          <p class="text-white text-sm font-medium">Contenido del curso</p>
        </div>

        <!-- Lista de secciones y lecciones -->
        <div class="flex-1 overflow-y-auto">
          <div v-for="section in sections" :key="section.id">
            <!-- Título de sección -->
            <div class="px-4 py-3 bg-gray-800 border-b border-gray-700">
              <p class="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                {{ section.title }}
              </p>
            </div>

            <!-- Lecciones de la sección -->
            <div
              v-for="lesson in section.lessons"
              :key="lesson.id"
              @click="selectLesson(lesson)"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-800 transition-colors"
              :class="
                currentLesson?.id === lesson.id
                  ? 'bg-indigo-900/50 border-l-2 border-l-indigo-500'
                  : 'hover:bg-gray-800'
              "
            >
              <!-- Checkbox de progreso -->
              <div
                class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs"
                :class="
                  completedLessons.includes(lesson.id)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-600'
                "
              >
                <span v-if="completedLessons.includes(lesson.id)">✓</span>
              </div>

              <!-- Info de la lección -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm truncate"
                  :class="currentLesson?.id === lesson.id ? 'text-white' : 'text-gray-300'"
                >
                  {{ lesson.title }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span v-if="lesson.youtube_url" class="text-xs text-gray-500">▶ Video</span>
                  <span v-if="lesson.pdf_url" class="text-xs text-orange-400">📄 PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const course = ref(null)
const sections = ref([])
const currentLesson = ref(null)
const completedLessons = ref([]) // IDs de lecciones completadas
const completing = ref(false)
// Controla si el temario está visible
const showSidebar = ref(true)

// ── Computed ──

// Convierte la URL de YouTube a formato embed
const youtubeEmbedUrl = computed(() => {
  if (!currentLesson.value?.youtube_url) return ''
  const url = currentLesson.value.youtube_url

  // Soporta formatos: youtu.be/ID y youtube.com/watch?v=ID
  const match = url.match(/(?:youtu\.be\/|watch\?v=)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
})

// Lista plana de todas las lecciones para navegar
const allLessons = computed(() => {
  return sections.value.flatMap((s) => s.lessons)
})

const currentIndex = computed(() => {
  if (!currentLesson.value) return -1
  return allLessons.value.findIndex((l) => l.id === currentLesson.value.id)
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < allLessons.value.length - 1)

const isCompleted = computed(() =>
  currentLesson.value ? completedLessons.value.includes(currentLesson.value.id) : false,
)

const totalLessons = computed(() => allLessons.value.length)

const completedCount = computed(
  () => allLessons.value.filter((l) => completedLessons.value.includes(l.id)).length,
)

// ── Lifecycle ──

onMounted(async () => {
  await loadCourse()
  await loadProgress()

  // Si hay una lección en la URL, seleccionarla
  if (route.query.leccion) {
    const lesson = allLessons.value.find((l) => l.id === route.query.leccion)
    if (lesson) currentLesson.value = lesson
  } else if (allLessons.value.length > 0) {
    // Selecciona la primera lección por defecto
    currentLesson.value = allLessons.value[0]
  }
})

// ── Funciones ──

async function loadCourse() {
  // Carga el curso por slug
  const { data: courseData } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', route.params.slug)
    .single()

  if (!courseData) {
    router.push('/')
    return
  }

  course.value = courseData

  // Carga secciones con lecciones
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
  }
}

// Carga el progreso del usuario
async function loadProgress() {
  if (!authStore.isAuthenticated) return

  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', authStore.session.user.id)
    .eq('completed', true)

  if (data) {
    completedLessons.value = data.map((p) => p.lesson_id)
  }
}

// Selecciona una lección
function selectLesson(lesson) {
  currentLesson.value = lesson
}

// Navega a la lección anterior
function prevLesson() {
  if (!hasPrev.value) return
  currentLesson.value = allLessons.value[currentIndex.value - 1]
}

// Navega a la siguiente lección
function nextLesson() {
  if (!hasNext.value) return
  currentLesson.value = allLessons.value[currentIndex.value + 1]
}

// Marca o desmarca la lección como completada
async function toggleComplete() {
  if (!currentLesson.value || !authStore.isAuthenticated) return

  completing.value = true
  const lessonId = currentLesson.value.id
  const userId = authStore.session.user.id

  if (isCompleted.value) {
    // Desmarcar como completada
    await supabase
      .from('lesson_progress')
      .update({ completed: false })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)

    completedLessons.value = completedLessons.value.filter((id) => id !== lessonId)
  } else {
    // Marcar como completada — upsert por si ya existe el registro
    await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
    })

    completedLessons.value.push(lessonId)
  }

  completing.value = false
}
</script>

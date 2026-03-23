<template>
  <div
    class="h-screen flex flex-col overflow-hidden"
    style="background: #fff; font-family: 'Manrope', system-ui, sans-serif"
  >
    <!-- ── Top Bar ── -->
    <header
      class="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style="background: #fff; border-bottom: 1px solid #e5e7eb"
    >
      <!-- Izquierda: ícono + título + progreso -->
      <div class="flex items-center gap-4 min-w-0">
        <!-- Triángulo + título -->
        <div class="flex items-center gap-2 min-w-0">
          <svg class="w-4 h-4 text-gray-800 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L22 20H2L12 2z" />
          </svg>
          <span class="text-gray-800 text-sm font-semibold truncate">{{
            course?.title || 'Cargando...'
          }}</span>
        </div>
      </div>

      <!-- Derecha: avatar -->
      <div class="flex items-center gap-2">
        <img
          v-if="authStore.userAvatar"
          :src="authStore.userAvatar"
          :alt="authStore.userName"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold"
        >
          {{ authStore.userName?.charAt(0) }}
        </div>
        <span class="text-gray-700 text-sm">{{ authStore.userName?.split(' ')[0] }}</span>
        <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
    </header>

    <!-- ── Cuerpo principal ── -->
    <div class="flex flex-1 overflow-hidden">
      <!-- ── Sidebar izquierdo ── -->
      <transition name="sidebar">
        <div
          v-show="showSidebar"
          class="w-72 flex flex-col flex-shrink-0 overflow-hidden m-3 rounded-2xl"
          style="background: #1a1a1a; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18)"
        >
          <!-- Header sidebar -->
          <div
            class="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style="border-bottom: 1px solid #2a2a2a"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
              </svg>
              <span class="text-white text-sm font-semibold">Course Content</span>
            </div>
            <button
              @click="showSidebar = false"
              class="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M11 19l-7-7 7-7M18 19l-7-7 7-7"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Lista de secciones -->
          <div class="flex-1 overflow-y-auto">
            <div v-for="section in sections" :key="section.id">
              <!-- Encabezado sección -->
              <button
                @click="toggleSection(section.id)"
                class="w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer"
                style="border-bottom: 1px solid #2a2a2a"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <svg
                    class="w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200"
                    :class="openSections.includes(section.id) ? '' : '-rotate-90'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                  <span class="text-gray-200 text-xs font-semibold text-left truncate">{{
                    section.title
                  }}</span>
                </div>
                <span class="text-gray-500 text-xs flex-shrink-0 ml-2"
                  >{{ getSectionCompleted(section) }}/{{ section.lessons.length }}</span
                >
              </button>

              <!-- Lecciones -->
              <div v-if="openSections.includes(section.id)">
                <div
                  v-for="lesson in section.lessons"
                  :key="lesson.id"
                  @click="selectLesson(lesson)"
                  class="flex items-start gap-3 px-4 py-2 cursor-pointer transition-colors"
                  :style="
                    currentLesson?.id === lesson.id
                      ? 'background: #1e2a3a; border-left: 2px solid #3b82f6;'
                      : 'border-left: 2px solid transparent;'
                  "
                  style="border-bottom: 1px solid #222"
                  @mouseenter="
                    (e) => {
                      if (currentLesson?.id !== lesson.id) e.currentTarget.style.background = '#222'
                    }
                  "
                  @mouseleave="
                    (e) => {
                      if (currentLesson?.id !== lesson.id) e.currentTarget.style.background = ''
                    }
                  "
                >
                  <!-- Título + duración -->
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm leading-snug"
                      :class="
                        currentLesson?.id === lesson.id ? 'text-white font-medium' : 'text-gray-300'
                      "
                    >
                      {{ lesson.title }}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ lesson.duration || getLessonTypeLabel(lesson.lesson_type) }}
                    </p>
                  </div>

                  <!-- Check verde si completada (derecha) -->
                  <div v-if="completedLessons.includes(lesson.id)" class="flex-shrink-0 mt-0.5">
                    <div
                      class="w-5 h-5 rounded-full flex items-center justify-center"
                      style="background: #0d9488"
                    >
                      <svg
                        class="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer: progreso -->
          <div
            class="px-4 py-4 flex-shrink-0"
            style="border-top: 1px solid #2a2a2a; background: #1a1a1a"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-xs font-medium">Course Progress</span>
              <span class="text-gray-300 text-xs font-semibold"
                >{{ progressPercent }}% Complete</span
              >
            </div>
            <div class="w-full h-1 rounded-full overflow-hidden" style="background: #333">
              <div
                class="h-full rounded-full transition-all duration-500"
                style="background: #3b82f6"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
          </div>
        </div>
      </transition>

      <!-- ── Contenido principal (fondo claro) ── -->
      <div class="flex-1 flex flex-col overflow-hidden" style="background: #fff">
        <!-- Botón para mostrar sidebar si está oculto -->
        <div v-if="!showSidebar" class="absolute left-0 top-1/2 z-10 -translate-y-1/2">
          <button
            @click="showSidebar = true"
            class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-r-lg transition-colors cursor-pointer shadow-lg"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Sin lección -->
          <div
            v-if="!currentLesson"
            class="flex-1 flex items-center justify-center h-full text-gray-400"
          >
            Selecciona una lección para comenzar
          </div>

          <div v-else>
            <!-- ── Video ── -->
            <div
              v-if="currentLesson.youtube_url"
              class="rounded-xl overflow-hidden mx-auto mt-6 max-w-5xl w-auto"
            >
              <div
                class="w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
                style="height: 65vh"
              >
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
            </div>

            <!-- Solo PDF -->
            <div
              v-else-if="currentLesson.pdf_url && !currentLesson.youtube_url"
              class="rounded-xl overflow-hidden mt-6 max-w-5xl mx-auto w-auto"
              style="height: 65vh; background: #111"
            >
              <iframe
                :src="`https://docs.google.com/viewer?url=${encodeURIComponent(currentLesson.pdf_url)}&embedded=true`"
                class="w-full h-full"
                frameborder="0"
              />
            </div>

            <!-- Texto Markdown (no tiene video) -->
            <div v-else-if="currentLesson.lesson_type === 'text'" class="px-8 pt-8">
              <!-- sin video, muestra contenido directo -->
            </div>

            <!-- ── Info debajo del video ── -->
            <div class="px-8 pt-7 pb-10 max-w-5xl mx-auto w-full">
              <!-- Título + descripción -->
              <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ currentLesson.title }}</h1>
              <p class="text-gray-500 text-sm mb-5">
                {{
                  currentLesson.description || 'Aprende los conceptos esenciales de esta lección.'
                }}
              </p>

              <!-- Tabs + botones -->
              <div
                class="flex items-center justify-between"
                style="border-bottom: 1px solid #e5e7eb"
              >
                <div class="flex gap-0">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px"
                    :class="
                      activeTab === tab.id
                        ? 'text-gray-900 border-gray-900'
                        : 'text-gray-400 hover:text-gray-600 border-transparent'
                    "
                  >
                    <!-- Ícono por tab -->
                    <svg
                      v-if="tab.id === 'contenido'"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
                    </svg>
                    <svg
                      v-else-if="tab.id === 'recursos'"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    <svg
                      v-else-if="tab.id === 'notas'"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    {{ tab.label }}
                    <span
                      v-if="tab.id === 'recursos' && currentLesson.pdf_url"
                      class="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style="background: #f3f4f6; color: #6b7280"
                      >1</span
                    >
                  </button>
                </div>

                <!-- Acciones derecha -->
                <div class="flex items-center gap-3 pb-px">
                  <button
                    class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    @click="toggleComplete"
                    :disabled="completing"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    :style="
                      isCompleted
                        ? 'background: #16a34a; color: white;'
                        : 'background: #111827; color: white;'
                    "
                  >
                    <svg
                      v-if="isCompleted"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ isCompleted ? 'Completed' : 'Mark as Complete' }}
                  </button>
                </div>
              </div>

              <!-- ── Contenido de tabs + Resources flotante ── -->
              <div class="flex gap-6 mt-6">
                <!-- Contenido del tab -->
                <div class="flex-1 min-w-0">
                  <!-- Tab: Contenido -->
                  <div v-if="activeTab === 'contenido'">
                    <!-- Si es lección de texto, muestra el markdown -->
                    <div
                      v-if="currentLesson.lesson_type === 'text' && currentLesson.content"
                      class="prose prose-gray prose-sm max-w-none"
                      v-html="renderMarkdown(currentLesson.content)"
                    />
                    <!-- Si tiene descripción/content como texto plano -->
                    <p
                      v-else-if="currentLesson.content"
                      class="text-gray-600 text-sm leading-relaxed whitespace-pre-line"
                    >
                      {{ currentLesson.content }}
                    </p>
                    <p v-else class="text-gray-400 text-sm italic">
                      Esta lección no tiene descripción adicional.
                    </p>
                  </div>

                  <!-- Tab: Recursos -->
                  <div v-else-if="activeTab === 'recursos'">
                    <div
                      v-if="currentLesson.pdf_url"
                      class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-lg flex items-center justify-center"
                          style="background: #fee2e2"
                        >
                          <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-800">Material de la lección</p>
                          <p class="text-xs text-gray-400">Archivo PDF</p>
                        </div>
                      </div>
                      <a
                        :href="currentLesson.pdf_url"
                        target="_blank"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </a>
                    </div>
                    <p v-else class="text-gray-400 text-sm italic">
                      No hay recursos en esta lección.
                    </p>
                  </div>

                  <!-- Tab: Notas -->
                  <div v-else-if="activeTab === 'notas'">
                    <p class="text-gray-400 text-sm italic">
                      Las notas estarán disponibles próximamente.
                    </p>
                  </div>

                  <!-- Tab: Quiz -->
                  <div v-else-if="activeTab === 'quiz'">
                    <p class="text-gray-400 text-sm italic">
                      El quiz estará disponible próximamente.
                    </p>
                  </div>
                </div>

                <!-- Panel Resources flotante (solo si tiene PDF y tab es contenido) -->
                <div
                  v-if="currentLesson.pdf_url && activeTab === 'contenido'"
                  class="w-64 flex-shrink-0"
                >
                  <div class="rounded-xl p-4" style="border: 1px solid #e5e7eb">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-semibold text-gray-800">Resources</span>
                      <button class="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div
                            class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style="background: #fee2e2"
                          >
                            <svg
                              class="w-4 h-4 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p class="text-xs font-medium text-gray-800 leading-tight">
                              Material PDF
                            </p>
                            <p class="text-xs text-gray-400">Archivo</p>
                          </div>
                        </div>
                        <a
                          :href="currentLesson.pdf_url"
                          target="_blank"
                          class="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navegación entre lecciones -->
              <div
                class="flex items-center justify-between mt-8 pt-4"
                style="border-top: 1px solid #f3f4f6"
              >
                <button
                  @click="prevLesson"
                  :disabled="!hasPrev"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30"
                  style="border: 1px solid #e5e7eb; color: #374151"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                  Anterior
                </button>
                <button
                  @click="nextLesson"
                  :disabled="!hasNext"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30"
                  style="border: 1px solid #e5e7eb; color: #374151"
                >
                  Siguiente
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </button>
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
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ── Estado ──
const course = ref(null)
const sections = ref([])
const currentLesson = ref(null)
const completedLessons = ref([])
const completing = ref(false)
const showSidebar = ref(true)
const openSections = ref([])
const activeTab = ref('contenido')

const tabs = [
  { id: 'contenido', label: 'Content' },
  { id: 'recursos', label: 'Resources' },
  { id: 'notas', label: 'Notes' },
]

// ── Computed ──
const youtubeEmbedUrl = computed(() => {
  if (!currentLesson.value?.youtube_url) return ''
  const url = currentLesson.value.youtube_url
  const match = url.match(/(?:youtu\.be\/|watch\?v=)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
})

const allLessons = computed(() => sections.value.flatMap((s) => s.lessons))
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
const progressPercent = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedCount.value / totalLessons.value) * 100)
})

function getSectionCompleted(section) {
  return section.lessons.filter((l) => completedLessons.value.includes(l.id)).length
}

function getLessonTypeLabel(type) {
  const labels = { video: 'Video', pdf: 'PDF', text: 'Lectura', quiz: 'Quiz', mixed: 'Video + PDF' }
  return labels[type] || 'Lección'
}

// ── Lifecycle ──
onMounted(async () => {
  await loadCourse()
  await loadProgress()
  if (route.query.leccion) {
    const lesson = allLessons.value.find((l) => l.id === route.query.leccion)
    if (lesson) currentLesson.value = lesson
  } else if (allLessons.value.length > 0) {
    currentLesson.value = allLessons.value[0]
  }
})

// ── Funciones ──
async function loadCourse() {
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
    openSections.value = sectionsData.map((s) => s.id)
  }
}

async function loadProgress() {
  if (!authStore.isAuthenticated) return
  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', authStore.session.user.id)
    .eq('completed', true)
  if (data) completedLessons.value = data.map((p) => p.lesson_id)
}

function selectLesson(lesson) {
  currentLesson.value = lesson
  activeTab.value = 'contenido'
}

function toggleSection(sectionId) {
  const index = openSections.value.indexOf(sectionId)
  if (index === -1) openSections.value.push(sectionId)
  else openSections.value.splice(index, 1)
}

function prevLesson() {
  if (!hasPrev.value) return
  currentLesson.value = allLessons.value[currentIndex.value - 1]
}

function nextLesson() {
  if (!hasNext.value) return
  currentLesson.value = allLessons.value[currentIndex.value + 1]
}

function renderMarkdown(content) {
  if (!content) return ''
  return marked(content)
}

async function toggleComplete() {
  if (!currentLesson.value || !authStore.isAuthenticated) return
  completing.value = true
  const lessonId = currentLesson.value.id
  const userId = authStore.session.user.id

  if (isCompleted.value) {
    await supabase
      .from('lesson_progress')
      .update({ completed: false })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
    completedLessons.value = completedLessons.value.filter((id) => id !== lessonId)
  } else {
    await supabase
      .from('lesson_progress')
      .upsert({ user_id: userId, lesson_id: lessonId, completed: true })
    completedLessons.value.push(lessonId)
  }
  completing.value = false
}
</script>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition:
    width 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
}
.sidebar-enter-from,
.sidebar-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>

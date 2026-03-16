<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Encabezado -->
    <div class="flex items-center gap-4 mb-8">
      <router-link to="/admin/cursos" class="text-gray-400 hover:text-gray-600 transition-colors">
        ← Volver
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ course?.title }}</h1>
        <p class="text-gray-400 text-sm mt-1">Gestiona las secciones y lecciones del curso</p>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="sectionsStore.loading && !course" class="text-center py-20 text-gray-400">
      Cargando...
    </div>

    <div v-else>
      <!-- Secciones -->
      <div class="space-y-4">
        <div
          v-for="section in sectionsStore.sections"
          :key="section.id"
          class="bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          <!-- Encabezado de sección -->
          <div
            class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200"
          >
            <div class="flex items-center gap-3 flex-1">
              <span class="text-gray-400 text-sm font-mono">§</span>
              <input
                v-if="editingSectionId === section.id"
                v-model="editingSectionTitle"
                @keyup.enter="saveSection(section.id)"
                @keyup.escape="editingSectionId = null"
                @blur="saveSection(section.id)"
                class="flex-1 border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autofocus
              />
              <span
                v-else
                @click="startEditSection(section)"
                class="font-medium text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                title="Click para editar"
              >
                {{ section.title }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <button
                @click="openNewLessonForm(section.id)"
                class="text-indigo-600 hover:text-indigo-800 text-sm transition-colors cursor-pointer"
              >
                + Lección
              </button>
              <button
                @click="confirmDeleteSection(section)"
                class="text-red-400 hover:text-red-600 text-sm transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>

          <!-- Lista de lecciones -->
          <div class="divide-y divide-gray-100">
            <!-- Sin lecciones -->
            <div v-if="section.lessons.length === 0" class="px-5 py-4 text-gray-400 text-sm italic">
              Sin lecciones todavía — haz clic en "+ Lección" para agregar
            </div>

            <!-- Lección existente -->
            <div
              v-for="lesson in section.lessons"
              :key="lesson.id"
              class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-gray-300 text-sm">▶</span>

                <!-- Editar lección inline -->
                <div v-if="editingLessonId === lesson.id" class="flex-1 flex flex-col gap-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      v-model="editingLesson.title"
                      placeholder="Título"
                      class="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      v-model="editingLesson.youtube_url"
                      placeholder="URL de YouTube"
                      class="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <label class="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input
                        v-model="editingLesson.is_preview"
                        type="checkbox"
                        class="accent-indigo-600"
                      />
                      Preview
                    </label>
                  </div>

                  <!-- Subida de PDF al editar -->
                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                      <span>PDF:</span>
                      <input
                        type="file"
                        accept=".pdf"
                        @change="handleEditLessonPdf"
                        class="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                      />
                    </label>
                    <span v-if="editingLesson.pdf_uploading" class="text-indigo-500 text-xs"
                      >Subiendo...</span
                    >
                    <span v-if="editingLesson.pdf_url" class="text-green-600 text-xs"
                      >✓ PDF listo</span
                    >
                  </div>

                  <div class="flex gap-2">
                    <button
                      @click="saveLesson(lesson.id, section.id)"
                      :disabled="editingLesson.pdf_uploading"
                      class="text-indigo-600 hover:text-indigo-800 text-sm cursor-pointer disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      @click="editingLessonId = null"
                      class="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <!-- Vista de lección -->
                <div v-else class="flex-1 flex items-center gap-3">
                  <span class="text-gray-700 text-sm">{{ lesson.title }}</span>
                  <span
                    v-if="lesson.is_preview"
                    class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                  >
                    Preview
                  </span>
                  <a
                    v-if="lesson.youtube_url"
                    :href="lesson.youtube_url"
                    target="_blank"
                    class="text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    Ver video ↗
                  </a>
                  <span v-if="lesson.pdf_url" class="text-xs text-orange-500"> 📄 PDF </span>
                </div>
              </div>

              <!-- Acciones de lección -->
              <div v-if="editingLessonId !== lesson.id" class="flex items-center gap-3">
                <button
                  @click="startEditLesson(lesson)"
                  class="text-indigo-600 hover:text-indigo-800 text-sm transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  @click="confirmDeleteLesson(lesson, section.id)"
                  class="text-red-400 hover:text-red-600 text-sm transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <!-- Formulario nueva lección -->
            <div
              v-if="newLessonSectionId === section.id"
              class="px-5 py-4 bg-indigo-50 border-t border-indigo-100"
            >
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <input
                    v-model="newLesson.title"
                    placeholder="Título de la lección"
                    class="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    v-model="newLesson.youtube_url"
                    placeholder="URL de YouTube (opcional)"
                    class="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label class="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                    <input
                      v-model="newLesson.is_preview"
                      type="checkbox"
                      class="accent-indigo-600"
                    />
                    Preview
                  </label>
                </div>

                <!-- Subida de PDF -->
                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <span>PDF (opcional):</span>
                    <input
                      type="file"
                      accept=".pdf"
                      @change="handleNewLessonPdf"
                      class="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                    />
                  </label>
                  <span v-if="newLesson.pdf_uploading" class="text-indigo-500 text-xs"
                    >Subiendo...</span
                  >
                  <span v-if="newLesson.pdf_url" class="text-green-600 text-xs">✓ PDF listo</span>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="handleCreateLesson(section.id)"
                    :disabled="newLesson.pdf_uploading"
                    class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                  <button
                    @click="newLessonSectionId = null"
                    class="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón agregar sección -->
      <div class="mt-6">
        <div v-if="showNewSectionForm" class="flex items-center gap-3">
          <input
            v-model="newSectionTitle"
            @keyup.enter="handleCreateSection"
            @keyup.escape="showNewSectionForm = false"
            placeholder="Nombre de la sección"
            class="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autofocus
          />
          <button
            @click="handleCreateSection"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Crear sección
          </button>
          <button
            @click="showNewSectionForm = false"
            class="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        <button
          v-else
          @click="showNewSectionForm = true"
          class="w-full border-2 border-dashed border-gray-200 hover:border-indigo-300 text-gray-400 hover:text-indigo-500 rounded-xl py-4 text-sm transition-colors cursor-pointer"
        >
          + Agregar sección
        </button>
      </div>
    </div>

    <!-- Modal confirmación eliminar sección -->
    <div
      v-if="sectionToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="sectionToDelete = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 class="font-bold text-gray-900 text-lg">¿Eliminar sección?</h3>
        <p class="text-gray-500 text-sm mt-2">
          Se eliminará <strong>{{ sectionToDelete.title }}</strong> y todas sus lecciones. Esta
          acción no se puede deshacer.
        </p>
        <div class="flex gap-3 mt-6">
          <button
            @click="sectionToDelete = null"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleDeleteSection"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmación eliminar lección -->
    <div
      v-if="lessonToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="lessonToDelete = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 class="font-bold text-gray-900 text-lg">¿Eliminar lección?</h3>
        <p class="text-gray-500 text-sm mt-2">
          Se eliminará <strong>{{ lessonToDelete.lesson.title }}</strong
          >. Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3 mt-6">
          <button
            @click="lessonToDelete = null"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleDeleteLesson"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSectionsStore } from '../../stores/sections'
import { useCoursesStore } from '../../stores/courses'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const sectionsStore = useSectionsStore()
const coursesStore = useCoursesStore()

// Curso actual
const course = ref(null)

// ── Nueva sección ──
const showNewSectionForm = ref(false)
const newSectionTitle = ref('')

// ── Editar sección inline ──
const editingSectionId = ref(null)
const editingSectionTitle = ref('')

// ── Eliminar sección ──
const sectionToDelete = ref(null)

// ── Nueva lección ──
const newLessonSectionId = ref(null)
const newLesson = reactive({
  title: '',
  youtube_url: '',
  is_preview: false,
  pdf_url: null,
  pdf_uploading: false,
})

// ── Editar lección inline ──
const editingLessonId = ref(null)
const editingLesson = reactive({
  title: '',
  youtube_url: '',
  is_preview: false,
  pdf_url: null,
  pdf_uploading: false,
})

// ── Eliminar lección ──
const lessonToDelete = ref(null)

// Carga el curso y sus secciones al montar la vista
onMounted(async () => {
  const courseId = route.params.id
  await coursesStore.fetchCourseById(courseId)
  course.value = coursesStore.currentCourse
  await sectionsStore.fetchSections(courseId)
})

// ── Secciones ──

function startEditSection(section) {
  editingSectionId.value = section.id
  editingSectionTitle.value = section.title
}

async function saveSection(id) {
  if (!editingSectionTitle.value.trim()) return
  await sectionsStore.updateSection(id, editingSectionTitle.value.trim())
  editingSectionId.value = null
}

async function handleCreateSection() {
  if (!newSectionTitle.value.trim()) return
  await sectionsStore.createSection(route.params.id, newSectionTitle.value.trim())
  newSectionTitle.value = ''
  showNewSectionForm.value = false
}

function confirmDeleteSection(section) {
  sectionToDelete.value = section
}

async function handleDeleteSection() {
  if (!sectionToDelete.value) return
  await sectionsStore.deleteSection(sectionToDelete.value.id)
  sectionToDelete.value = null
}

// ── Subida de PDF para nueva lección ──
async function handleNewLessonPdf(event) {
  const file = event.target.files[0]
  if (!file) return

  newLesson.pdf_uploading = true

  // Nombre único para evitar colisiones
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage.from('recursos').upload(fileName, file)

  if (error) {
    console.error('Error subiendo PDF:', error.message)
  } else {
    // Obtiene la URL pública del archivo
    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(data.path)
    newLesson.pdf_url = urlData.publicUrl
  }

  newLesson.pdf_uploading = false
}

// ── Subida de PDF para editar lección ──
async function handleEditLessonPdf(event) {
  const file = event.target.files[0]
  if (!file) return

  editingLesson.pdf_uploading = true

  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage.from('recursos').upload(fileName, file)

  if (error) {
    console.error('Error subiendo PDF:', error.message)
  } else {
    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(data.path)
    editingLesson.pdf_url = urlData.publicUrl
  }

  editingLesson.pdf_uploading = false
}

// ── Lecciones ──

function openNewLessonForm(sectionId) {
  newLessonSectionId.value = sectionId
  newLesson.title = ''
  newLesson.youtube_url = ''
  newLesson.is_preview = false
  newLesson.pdf_url = null
  newLesson.pdf_uploading = false
}

async function handleCreateLesson(sectionId) {
  if (!newLesson.title.trim()) return
  await sectionsStore.createLesson(sectionId, {
    title: newLesson.title.trim(),
    youtube_url: newLesson.youtube_url || null,
    is_preview: newLesson.is_preview,
    pdf_url: newLesson.pdf_url || null,
  })
  newLessonSectionId.value = null
}

function startEditLesson(lesson) {
  editingLessonId.value = lesson.id
  editingLesson.title = lesson.title
  editingLesson.youtube_url = lesson.youtube_url || ''
  editingLesson.is_preview = lesson.is_preview
  editingLesson.pdf_url = lesson.pdf_url || null
  editingLesson.pdf_uploading = false
}

async function saveLesson(lessonId, sectionId) {
  if (!editingLesson.title.trim()) return
  await sectionsStore.updateLesson(lessonId, sectionId, {
    title: editingLesson.title.trim(),
    youtube_url: editingLesson.youtube_url || null,
    is_preview: editingLesson.is_preview,
    pdf_url: editingLesson.pdf_url || null,
  })
  editingLessonId.value = null
}

function confirmDeleteLesson(lesson, sectionId) {
  lessonToDelete.value = { lesson, sectionId }
}

async function handleDeleteLesson() {
  if (!lessonToDelete.value) return
  await sectionsStore.deleteLesson(lessonToDelete.value.lesson.id, lessonToDelete.value.sectionId)
  lessonToDelete.value = null
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Encabezado -->
    <div class="flex items-center gap-4 mb-8">
      <router-link
        :to="`/admin/cursos/${courseId}`"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Volver al curso
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Editor de Quiz</h1>
        <p class="text-gray-400 text-sm mt-1">{{ lesson?.title }}</p>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="quizStore.loading && questions.length === 0" class="text-center py-20 text-gray-400">
      Cargando preguntas...
    </div>

    <div v-else>
      <!-- Lista de preguntas -->
      <div class="space-y-4 mb-6">
        <!-- Sin preguntas -->
        <div v-if="questions.length === 0" class="text-center py-12 text-gray-400">
          <p class="text-lg">No hay preguntas todavía</p>
          <p class="text-sm mt-1">Agrega la primera pregunta para empezar</p>
        </div>

        <!-- Pregunta existente -->
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <!-- Número y tipo -->
              <div class="flex items-center gap-2 mb-2">
                <span class="text-gray-400 text-sm font-mono">{{ index + 1 }}.</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-700': question.type === 'multiple',
                    'bg-purple-100 text-purple-700': question.type === 'truefalse',
                    'bg-orange-100 text-orange-700': question.type === 'short',
                  }"
                >
                  {{ typeLabel(question.type) }}
                </span>
              </div>

              <!-- Texto de la pregunta -->
              <p class="text-gray-800 font-medium mb-3">{{ question.question }}</p>

              <!-- Opciones -->
              <div v-if="question.type !== 'short'" class="space-y-1">
                <div
                  v-for="option in question.quiz_options"
                  :key="option.id"
                  class="flex items-center gap-2 text-sm"
                >
                  <span
                    class="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-xs"
                    :class="
                      option.is_correct
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    "
                  >
                    <span v-if="option.is_correct">✓</span>
                  </span>
                  <span :class="option.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'">
                    {{ option.text }}
                  </span>
                </div>
              </div>

              <!-- Respuesta corta -->
              <div v-else class="text-sm text-gray-400 italic">
                El estudiante escribirá su respuesta
              </div>
            </div>

            <!-- Eliminar pregunta -->
            <button
              @click="confirmDelete(question)"
              class="text-red-400 hover:text-red-600 text-sm transition-colors cursor-pointer flex-shrink-0"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario nueva pregunta -->
      <div class="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6">
        <h2 class="font-semibold text-gray-800 mb-4">+ Nueva pregunta</h2>

        <div class="space-y-4">
          <!-- Tipo de pregunta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              v-model="newQuestion.type"
              @change="onTypeChange"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="multiple">Opción múltiple</option>
              <option value="truefalse">Verdadero / Falso</option>
              <option value="short">Respuesta corta</option>
            </select>
          </div>

          <!-- Texto de la pregunta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
            <input
              v-model="newQuestion.question"
              placeholder="Escribe la pregunta..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Opciones para múltiple -->
          <div v-if="newQuestion.type === 'multiple'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Opciones <span class="text-gray-400 font-normal">(marca la correcta)</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(option, i) in newQuestion.options"
                :key="i"
                class="flex items-center gap-3"
              >
                <!-- Radio para marcar correcta -->
                <input
                  type="radio"
                  :name="'correct-option'"
                  :value="i"
                  v-model="newQuestion.correctIndex"
                  class="accent-indigo-600 flex-shrink-0"
                />
                <input
                  v-model="option.text"
                  :placeholder="`Opción ${i + 1}`"
                  class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  v-if="newQuestion.options.length > 2"
                  @click="removeOption(i)"
                  class="text-gray-300 hover:text-red-400 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <button
              @click="addOption"
              class="mt-2 text-indigo-600 hover:text-indigo-800 text-sm cursor-pointer"
            >
              + Agregar opción
            </button>
          </div>

          <!-- Opciones para Verdadero/Falso -->
          <div v-if="newQuestion.type === 'truefalse'">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Respuesta correcta </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="0"
                  v-model="newQuestion.correctIndex"
                  class="accent-indigo-600"
                />
                <span class="text-sm text-gray-700">Verdadero</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="1"
                  v-model="newQuestion.correctIndex"
                  class="accent-indigo-600"
                />
                <span class="text-sm text-gray-700">Falso</span>
              </label>
            </div>
          </div>

          <!-- Error -->
          <div v-if="formError" class="text-red-500 text-sm">{{ formError }}</div>

          <!-- Botón guardar -->
          <button
            @click="handleCreateQuestion"
            :disabled="quizStore.loading"
            class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {{ quizStore.loading ? 'Guardando...' : 'Agregar pregunta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div
      v-if="questionToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="questionToDelete = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 class="font-bold text-gray-900 text-lg">¿Eliminar pregunta?</h3>
        <p class="text-gray-500 text-sm mt-2">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3 mt-6">
          <button
            @click="questionToDelete = null"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizStore } from '../../stores/quiz'
import { supabase } from '@/services/supabase'

const route = useRoute()
const quizStore = useQuizStore()

// IDs desde la URL
const courseId = computed(() => route.params.courseId)
const lessonId = computed(() => route.params.lessonId)

const lesson = ref(null)
const formError = ref(null)
const questionToDelete = ref(null)

// Lista de preguntas del store
const questions = computed(() => quizStore.questions)

// Formulario nueva pregunta
const newQuestion = reactive({
  type: 'multiple',
  question: '',
  options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  correctIndex: 0,
})

onMounted(async () => {
  // Carga los datos de la lección
  const { data } = await supabase.from('lessons').select('*').eq('id', lessonId.value).single()

  lesson.value = data

  // Carga las preguntas del quiz
  await quizStore.fetchQuestions(lessonId.value)
})

// Resetea las opciones al cambiar el tipo
function onTypeChange() {
  newQuestion.correctIndex = 0
  if (newQuestion.type === 'multiple') {
    newQuestion.options = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
  } else if (newQuestion.type === 'truefalse') {
    newQuestion.options = [{ text: 'Verdadero' }, { text: 'Falso' }]
  }
}

function addOption() {
  newQuestion.options.push({ text: '' })
}

function removeOption(index) {
  newQuestion.options.splice(index, 1)
  if (newQuestion.correctIndex >= newQuestion.options.length) {
    newQuestion.correctIndex = 0
  }
}

async function handleCreateQuestion() {
  formError.value = null

  if (!newQuestion.question.trim()) {
    formError.value = 'Escribe la pregunta'
    return
  }

  let options = []

  if (newQuestion.type === 'multiple') {
    const filled = newQuestion.options.filter((o) => o.text.trim())
    if (filled.length < 2) {
      formError.value = 'Agrega al menos 2 opciones'
      return
    }
    options = newQuestion.options
      .filter((o) => o.text.trim())
      .map((o, i) => ({
        text: o.text.trim(),
        is_correct: i === Number(newQuestion.correctIndex),
      }))
  } else if (newQuestion.type === 'truefalse') {
    options = [
      {
        text: 'Verdadero',
        is_correct: newQuestion.correctIndex === 0 || newQuestion.correctIndex === '0',
      },
      {
        text: 'Falso',
        is_correct: newQuestion.correctIndex === 1 || newQuestion.correctIndex === '1',
      },
    ]
  }

  const result = await quizStore.createQuestion(lessonId.value, {
    question: newQuestion.question.trim(),
    type: newQuestion.type,
    options,
  })

  if (result) {
    // Resetea el formulario
    newQuestion.question = ''
    newQuestion.type = 'multiple'
    newQuestion.options = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    newQuestion.correctIndex = 0
  }
}

function confirmDelete(question) {
  questionToDelete.value = question
}

async function handleDelete() {
  if (!questionToDelete.value) return
  await quizStore.deleteQuestion(questionToDelete.value.id)
  questionToDelete.value = null
}

function typeLabel(type) {
  const labels = {
    multiple: 'Opción múltiple',
    truefalse: 'Verdadero / Falso',
    short: 'Respuesta corta',
  }
  return labels[type] || type
}
</script>

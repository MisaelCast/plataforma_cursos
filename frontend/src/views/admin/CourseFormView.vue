<template>
  <div class="max-w-3xl mx-auto px-6 py-8">

    <!-- Encabezado -->
    <div class="flex items-center gap-4 mb-8">
      <router-link
        to="/admin/cursos"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Volver
      </router-link>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEditing ? 'Editar curso' : 'Nuevo curso' }}
      </h1>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          @input="generateSlug"
          type="text"
          placeholder="Ej: Introducción a Vue 3"
          class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <!-- Slug -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Slug <span class="text-gray-400 font-normal">(URL del curso)</span>
        </label>
        <input
          v-model="form.slug"
          type="text"
          placeholder="introduccion-a-vue-3"
          class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          required
        />
        <p class="text-gray-400 text-xs mt-1">
          URL: /cursos/{{ form.slug || 'slug-del-curso' }}
        </p>
      </div>

      <!-- Descripción corta -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Descripción corta
        </label>
        <input
          v-model="form.short_description"
          type="text"
          placeholder="Resumen breve del curso (aparece en las tarjetas)"
          maxlength="160"
          class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Descripción completa -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Descripción completa
        </label>
        <textarea
          v-model="form.description"
          rows="5"
          placeholder="Descripción detallada del curso..."
          class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <!-- Nivel y Categoría en fila -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select
            v-model="form.level"
            class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Sin especificar</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            v-model="form.category_id"
            class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Sin categoría</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- URL del thumbnail -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          URL de la imagen de portada
        </label>
        <input
          v-model="form.thumbnail_url"
          type="text"
          placeholder="https://..."
          class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <!-- Preview de la imagen -->
        <img
          v-if="form.thumbnail_url"
          :src="form.thumbnail_url"
          class="mt-2 w-full max-h-48 object-cover rounded-lg border border-gray-200"
        />
      </div>

      <!-- Opciones -->
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.is_published"
            type="checkbox"
            class="w-4 h-4 accent-indigo-600"
          />
          <span class="text-sm text-gray-700">Publicar curso</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.is_featured"
            type="checkbox"
            class="w-4 h-4 accent-indigo-600"
          />
          <span class="text-sm text-gray-700">Curso destacado</span>
        </label>
      </div>

      <!-- Error -->
      <div v-if="formError" class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
        {{ formError }}
      </div>

      <!-- Botones -->
      <div class="flex gap-3 pt-2">
        <router-link
          to="/admin/cursos"
          class="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          {{ saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear curso') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCoursesStore } from '../../stores/courses'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const coursesStore = useCoursesStore()

// true si estamos editando un curso existente
const isEditing = computed(() => !!route.params.id)

// Estado de carga local — independiente del store
// así el formulario no se bloquea por otras operaciones
const saving = ref(false)
const formError = ref(null)

// Lista de categorías para el select
const categories = ref([])

// Datos del formulario
const form = reactive({
  title: '',
  slug: '',
  short_description: '',
  description: '',
  level: '',
  category_id: '',
  thumbnail_url: '',
  is_published: false,
  is_featured: false
})

onMounted(async () => {
  await fetchCategories()

  if (isEditing.value) {
    // Carga el curso a editar
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) {
      formError.value = error.message
      return
    }

    // Rellena el formulario con los datos del curso
    form.title             = data.title
    form.slug              = data.slug
    form.short_description = data.short_description || ''
    form.description       = data.description || ''
    form.level             = data.level || ''
    form.category_id       = data.category_id || ''
    form.thumbnail_url     = data.thumbnail_url || ''
    form.is_published      = data.is_published
    form.is_featured       = data.is_featured
  }
})

// Obtiene las categorías desde Supabase
async function fetchCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  categories.value = data || []
}

// Genera el slug automáticamente desde el título
function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .replace(/[^a-z0-9\s-]/g, '')   // elimina caracteres especiales
    .trim()
    .replace(/\s+/g, '-')            // espacios → guiones
}

// Envía el formulario (crear o editar)
async function handleSubmit() {
  saving.value = true
  formError.value = null

  const payload = {
    title:             form.title,
    slug:              form.slug,
    short_description: form.short_description || null,
    description:       form.description || null,
    level:             form.level || null,
    category_id:       form.category_id || null,
    thumbnail_url:     form.thumbnail_url || null,
    is_published:      form.is_published,
    is_featured:       form.is_featured
  }

  if (isEditing.value) {
    const result = await coursesStore.updateCourse(route.params.id, payload)
    if (result) {
      router.push('/admin/cursos')
    } else {
      formError.value = coursesStore.error
    }
  } else {
    const result = await coursesStore.createCourse(payload)
    if (result) {
      router.push('/admin/cursos')
    } else {
      formError.value = coursesStore.error
    }
  }

  saving.value = false
}
</script>
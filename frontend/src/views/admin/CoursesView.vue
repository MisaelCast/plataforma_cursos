<template>
  <div class="max-w-7xl mx-auto px-6 py-8">

    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Cursos</h1>
        <p class="text-gray-500 text-sm mt-1">Gestiona todos los cursos de la plataforma</p>
      </div>
      <router-link
        to="/admin/cursos/nuevo"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        + Nuevo curso
      </router-link>
    </div>

    <!-- Estado de carga -->
    <div v-if="coursesStore.loading" class="text-center py-20 text-gray-400">
      Cargando cursos...
    </div>

    <!-- Sin cursos -->
    <div v-else-if="coursesStore.courses.length === 0" class="text-center py-20">
      <p class="text-gray-400 text-lg">No hay cursos todavía</p>
      <p class="text-gray-500 text-sm mt-1">Crea tu primer curso para empezar</p>
    </div>

    <!-- Tabla de cursos -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">

        <!-- Encabezados -->
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-gray-500 font-medium">Curso</th>
            <th class="text-left px-6 py-3 text-gray-500 font-medium">Categoría</th>
            <th class="text-left px-6 py-3 text-gray-500 font-medium">Nivel</th>
            <th class="text-left px-6 py-3 text-gray-500 font-medium">Estado</th>
            <th class="text-left px-6 py-3 text-gray-500 font-medium">Acciones</th>
          </tr>
        </thead>

        <!-- Filas -->
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="course in coursesStore.courses"
            :key="course.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <!-- Nombre del curso -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="course.thumbnail_url"
                  :src="course.thumbnail_url"
                  class="w-10 h-10 rounded-lg object-cover bg-gray-100"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm"
                >
                  {{ course.title.charAt(0) }}
                </div>
                <div>
                   <router-link
    :to="`/admin/cursos/${course.id}`"
    class="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
  >
    {{ course.title }}
  </router-link>
                  <p class="text-gray-400 text-xs">{{ course.slug }}</p>
                </div>
              </div>
            </td>

            <!-- Categoría -->
            <td class="px-6 py-4 text-gray-600">
              {{ course.categories?.name || '—' }}
            </td>

            <!-- Nivel -->
            <td class="px-6 py-4">
              <span class="capitalize text-gray-600">{{ levelLabel(course.level) }}</span>
            </td>

            <!-- Estado publicado/borrador -->
            <td class="px-6 py-4">
              <span
                :class="course.is_published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ course.is_published ? 'Publicado' : 'Borrador' }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <router-link
                  :to="`/admin/cursos/${course.id}/editar`"
                  class="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Editar
                </router-link>
                <button
                  @click.stop="confirmDelete(course)"
                  class="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div
      v-if="courseToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="courseToDelete = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 class="font-bold text-gray-900 text-lg">¿Eliminar curso?</h3>
        <p class="text-gray-500 text-sm mt-2">
          Estás a punto de eliminar <strong>{{ courseToDelete.title }}</strong>.
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3 mt-6">
          <button
            @click="courseToDelete = null"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCoursesStore } from '../../stores/courses'

const coursesStore = useCoursesStore()

// Curso seleccionado para eliminar (controla el modal)
const courseToDelete = ref(null)

// Carga los cursos al montar la vista
onMounted(async () => {
  console.log('CoursesView montado')
  coursesStore.loading = false
  await coursesStore.fetchCourses()
  console.log('Cursos cargados:', coursesStore.courses)
})


// Muestra el modal de confirmación
function confirmDelete(course) {
  courseToDelete.value = course
}

// Elimina el curso confirmado
async function handleDelete() {
  if (!courseToDelete.value) return
  await coursesStore.deleteCourse(courseToDelete.value.id)
  courseToDelete.value = null
}

// Traduce el nivel a español
function levelLabel(level) {
  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  }
  return labels[level] || '—'
}
</script>
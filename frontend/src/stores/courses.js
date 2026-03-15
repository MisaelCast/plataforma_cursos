import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useCoursesStore = defineStore('courses', () => {
  // ─────────────────────────────────────────
  // Estado
  // ─────────────────────────────────────────

  const courses = ref([])
  const currentCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ─────────────────────────────────────────
  // Acciones
  // ─────────────────────────────────────────

  // Obtiene todos los cursos
  async function fetchCourses() {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*, categories (id, name)')
        .order('created_at', { ascending: false })

      if (err) throw err
      courses.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchCourses error:', err.message)
    } finally {
      // Siempre se ejecuta, aunque haya error
      // evita que loading quede en true para siempre
      loading.value = false
    }
  }

  // Obtiene un curso por su ID
  async function fetchCourseById(id) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*, categories (id, name)')
        .eq('id', id)
        .single()

      if (err) throw err
      currentCourse.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchCourseById error:', err.message)
    } finally {
      loading.value = false
    }
  }

  // Crea un nuevo curso
  async function createCourse(courseData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single()

      if (err) throw err
      courses.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('createCourse error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualiza un curso existente
  async function updateCourse(id, courseData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Actualiza el curso en la lista local
      const index = courses.value.findIndex((c) => c.id === id)
      if (index !== -1) courses.value[index] = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('updateCourse error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Elimina un curso
  async function deleteCourse(id) {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase.from('courses').delete().eq('id', id)

      if (err) throw err
      courses.value = courses.value.filter((c) => c.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteCourse error:', err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    currentCourse,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  }
})

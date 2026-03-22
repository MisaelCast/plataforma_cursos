import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useSectionsStore = defineStore('sections', () => {
  // ─────────────────────────────────────────
  // Estado
  // ─────────────────────────────────────────

  // Secciones del curso actual con sus lecciones incluidas
  const sections = ref([])

  // Estado de carga y error
  const loading = ref(false)
  const error = ref(null)

  // ─────────────────────────────────────────
  // Acciones — Secciones
  // ─────────────────────────────────────────

  // Obtiene todas las secciones de un curso con sus lecciones
  async function fetchSections(courseId) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('sections')
        .select(
          `
          *,
          lessons (*)
        `,
        )
        .eq('course_id', courseId)
        .order('position', { ascending: true })

      if (err) throw err

      // Ordena las lecciones de cada sección por position
      sections.value = data.map((section) => ({
        ...section,
        lessons: (section.lessons || []).sort((a, b) => a.position - b.position),
      }))
    } catch (err) {
      error.value = err.message
      console.error('fetchSections error:', err.message)
    } finally {
      loading.value = false
    }
  }

  // Crea una nueva sección
  async function createSection(courseId, title) {
    loading.value = true
    error.value = null

    try {
      // La position es el número de secciones actuales + 1
      const position = sections.value.length

      const { data, error: err } = await supabase
        .from('sections')
        .insert({ course_id: courseId, title, position })
        .select()
        .single()

      if (err) throw err

      // Agrega la sección con lista de lecciones vacía
      sections.value.push({ ...data, lessons: [] })
      return data
    } catch (err) {
      error.value = err.message
      console.error('createSection error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualiza el título de una sección
  async function updateSection(id, title) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('sections')
        .update({ title })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Actualiza en la lista local
      const index = sections.value.findIndex((s) => s.id === id)
      if (index !== -1) sections.value[index].title = data.title
      return data
    } catch (err) {
      error.value = err.message
      console.error('updateSection error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Elimina una sección (y sus lecciones en cascada por la DB)
  async function deleteSection(id) {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase.from('sections').delete().eq('id', id)

      if (err) throw err

      // Elimina de la lista local
      sections.value = sections.value.filter((s) => s.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteSection error:', err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────
  // Acciones — Lecciones
  // ─────────────────────────────────────────

  // Crea una nueva lección dentro de una sección
  async function createLesson(sectionId, lessonData) {
    loading.value = true
    error.value = null

    try {
      // Encuentra la sección para calcular la position
      const section = sections.value.find((s) => s.id === sectionId)
      const position = section ? section.lessons.length : 0

      const { data, error: err } = await supabase
        .from('lessons')
        .insert({ ...lessonData, section_id: sectionId, position })
        .select()
        .single()

      if (err) throw err

      // Agrega la lección a la sección en la lista local
      if (section) section.lessons.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('createLesson error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualiza una lección
  async function updateLesson(lessonId, sectionId, lessonData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', lessonId)
        .select()
        .single()

      if (err) throw err

      // Actualiza en la lista local
      const section = sections.value.find((s) => s.id === sectionId)
      if (section) {
        const index = section.lessons.findIndex((l) => l.id === lessonId)
        if (index !== -1) section.lessons[index] = data
      }
      return data
    } catch (err) {
      error.value = err.message
      console.error('updateLesson error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Elimina una lección
  async function deleteLesson(lessonId, sectionId) {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase.from('lessons').delete().eq('id', lessonId)

      if (err) throw err

      // Elimina de la lista local
      const section = sections.value.find((s) => s.id === sectionId)
      if (section) {
        section.lessons = section.lessons.filter((l) => l.id !== lessonId)
      }
      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteLesson error:', err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    sections,
    loading,
    error,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    createLesson,
    updateLesson,
    deleteLesson,
  }
})

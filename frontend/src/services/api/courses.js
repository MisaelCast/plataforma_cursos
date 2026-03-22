import { supabase } from '../supabase'

// Obtener todos los cursos publicados (para el catálogo público)
export async function getCourses() {
  return supabase
    .from('courses')
    .select('*, categories(name)')
    .eq('published', true)
    .order('created_at', { ascending: false })
}

// Obtener un curso con sus secciones y lecciones
export async function getCourseById(id) {
  return supabase
    .from('courses')
    .select('*, categories(name), sections(*, lessons(*))')
    .eq('id', id)
    .single()
}

// Obtener todos los cursos (para el panel admin, sin filtro de publicado)
export async function getAdminCourses() {
  return supabase
    .from('courses')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
}

// Crear un curso nuevo
export async function createCourse(data) {
  return supabase.from('courses').insert(data).select().single()
}

// Actualizar un curso
export async function updateCourse(id, data) {
  return supabase.from('courses').update(data).eq('id', id).select().single()
}

// Borrar un curso
export async function deleteCourse(id) {
  return supabase.from('courses').delete().eq('id', id)
}

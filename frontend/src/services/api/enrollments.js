import { supabase } from '../supabase'

// Verificar si el usuario ya está inscrito en un curso
export async function getEnrollment(userId, courseId) {
  return supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()
}

// Obtener todos los cursos en los que está inscrito el usuario
export async function getUserEnrollments(userId) {
  return supabase
    .from('enrollments')
    .select('*, courses(*, categories(name))')
    .eq('user_id', userId)
}

// Inscribir al usuario en un curso
export async function enrollUser(userId, courseId) {
  return supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single()
}

// Cancelar inscripción
export async function unenrollUser(userId, courseId) {
  return supabase.from('enrollments').delete().eq('user_id', userId).eq('course_id', courseId)
}

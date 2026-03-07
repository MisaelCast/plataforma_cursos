import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // ─────────────────────────────────────────
  // Estado
  // ─────────────────────────────────────────

  // Sesión de Supabase (contiene el token y datos del usuario de auth)
  const session = ref(null)

  // Perfil del usuario desde nuestra tabla profiles
  const profile = ref(null)

  // Indica si todavía estamos cargando la sesión inicial
  const loading = ref(true)

  // ─────────────────────────────────────────
  // Computed (getters)
  // ─────────────────────────────────────────

  // true si hay sesión activa
  const isAuthenticated = computed(() => !!session.value)

  // true si el usuario tiene rol admin
  const isAdmin = computed(() => profile.value?.role === 'admin')

  // Nombre del usuario para mostrar en la UI
  const userName = computed(() => profile.value?.full_name || 'Usuario')

  // Avatar del usuario
  const userAvatar = computed(() => profile.value?.avatar_url || null)

  // ─────────────────────────────────────────
  // Acciones
  // ─────────────────────────────────────────

  // Carga el perfil del usuario desde la tabla profiles
  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      console.error('Error cargando perfil:', error.message)
      return
    }

    profile.value = data
  }

  // Inicializa el store: obtiene la sesión actual y escucha cambios
  async function init() {
    // Obtiene la sesión guardada en el navegador
    const { data } = await supabase.auth.getSession()
    session.value = data.session

    // Si hay sesión activa, carga el perfil del usuario
    if (session.value) {
      await fetchProfile(session.value.user.id)
    }

    loading.value = false

    // Escucha cambios de sesión (login, logout, refresh de token)
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession

      if (newSession) {
        // Nueva sesión: carga el perfil
        await fetchProfile(newSession.user.id)
      } else {
        // Sesión cerrada: limpia el perfil
        profile.value = null
      }
    })
  }

  // Cierra la sesión del usuario
  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error cerrando sesión:', error.message)
      return
    }
    // Limpia el estado local
    session.value = null
    profile.value = null
  }

  return {
    // Estado
    session,
    profile,
    loading,
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    userAvatar,
    // Acciones
    init,
    logout,
    fetchProfile,
  }
})

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import CallbackView from '../views/auth/CallbackView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Página principal — catálogo de cursos
      path: '/',
      name: 'home',
      component: () => import('../views/CatalogView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Detalle público del curso
      path: '/cursos/:slug',
      name: 'curso',
      component: () => import('../views/CourseView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Panel admin principal
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      // Listado de cursos en admin
      path: '/admin/cursos',
      name: 'admin-cursos',
      component: () => import('../views/admin/CoursesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      // Formulario para crear nuevo curso
      path: '/admin/cursos/nuevo',
      name: 'admin-cursos-nuevo',
      component: () => import('../views/admin/CourseFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      // Formulario para editar curso existente
      path: '/admin/cursos/:id/editar',
      name: 'admin-cursos-editar',
      component: () => import('../views/admin/CourseFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      // Vista del reproductor de video
      path: '/cursos/:slug/aprender',
      name: 'aprender',
      component: () => import('../views/LearnView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Detalle del curso — gestión de secciones y lecciones
      path: '/admin/cursos/:id',
      name: 'admin-curso-detalle',
      component: () => import('../views/admin/CourseDetailView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      // Editor de quiz — admin
      path: '/admin/cursos/:courseId/quiz/:lessonId',
      name: 'admin-quiz-editor',
      component: () => import('../views/admin/QuizEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/auth/callback',
      name: 'callback',
      component: CallbackView,
    },
    {
      // Cualquier ruta no encontrada redirige al inicio
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ─────────────────────────────────────────
// Guard de navegación global
// Se ejecuta antes de cada cambio de ruta
// ─────────────────────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Espera a que el store termine de cargar la sesión
  if (authStore.loading) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Ruta solo para visitantes y usuario ya autenticado
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // Ruta protegida y usuario no autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Ruta de admin y usuario no es admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }
})

export default router

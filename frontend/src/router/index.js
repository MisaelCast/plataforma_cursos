import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import CallbackView from '../views/auth/CallbackView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
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
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ─────────────────────────────────────────
// Guard de navegación global
// ─────────────────────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Espera a que el store termine de cargar la sesión
  // antes de evaluar cualquier guard
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

  // Si la ruta es solo para visitantes y el usuario ya está autenticado
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Si la ruta requiere ser admin y el usuario no lo es
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }
})

export default router

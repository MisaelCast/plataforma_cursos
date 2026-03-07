import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializa el store de auth antes de montar la app
// para que la sesión esté disponible desde el primer render
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './assets/index.css'
import App from './App.vue'

// Initialize Firebase
import { initializeFirebase } from './firebase'

// Initialize Firebase before mounting the app
try {
  initializeFirebase()
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

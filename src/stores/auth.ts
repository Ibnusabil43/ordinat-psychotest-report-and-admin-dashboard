import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const userRole = ref<'admin' | 'tester' | null>(null)
  const token = ref<string | null>(null)
  const userEmail = ref<string | null>(null)

  const isAdmin = computed(() => userRole.value === 'admin')
  const isTester = computed(() => userRole.value === 'tester')

  function login(role: 'admin' | 'tester', email: string, authToken?: string) {
    isLoggedIn.value = true
    userRole.value = role
    userEmail.value = email
    token.value = authToken || `mock-token-${Date.now()}`
    
    // Persist to localStorage
    localStorage.setItem('auth', JSON.stringify({
      role,
      email,
      token: token.value
    }))
  }

  function logout() {
    isLoggedIn.value = false
    userRole.value = null
    userEmail.value = null
    token.value = null
    localStorage.removeItem('auth')
  }

  function restoreSession() {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const { role, email, token: storedToken } = JSON.parse(stored)
        isLoggedIn.value = true
        userRole.value = role
        userEmail.value = email
        token.value = storedToken
        return true
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('auth')
      }
    }
    return false
  }

  return {
    isLoggedIn,
    userRole,
    token,
    userEmail,
    isAdmin,
    isTester,
    login,
    logout,
    restoreSession
  }
})

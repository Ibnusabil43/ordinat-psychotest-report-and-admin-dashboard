// Authentication Store - Pinia store with Firebase integration
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User, UserRole, UserSettings } from '@/types/models'
import {
  loginWithEmailPassword,
  logout as firebaseLogout,
  observeAuthState,
  getUserData,
  updateUserProfile as updateProfile,
  updateUserSettings as updateSettings,
  changePassword as firebaseChangePassword,
} from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isLoggedIn = ref(false)
  const userRole = ref<UserRole | null>(null)
  const token = ref<string | null>(null)
  const userEmail = ref<string | null>(null)
  const userId = ref<string | null>(null)
  const displayName = ref<string | null>(null)
  const userData = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isAdmin = computed(() => userRole.value === 'admin')
  const isTester = computed(() => userRole.value === 'tester')
  const userSettings = computed(() => userData.value?.settings || null)
  const userName = computed(() => displayName.value || userData.value?.displayName || 'User')

  /**
   * Initialize auth state listener
   */
  function initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Auth initialization timed out')
        isInitialized.value = true
        resolve()
      }, 5000) // 5 second timeout

      const unsubscribe = observeAuthState(async (firebaseUser: FirebaseUser | null) => {
        clearTimeout(timeout) // Clear timeout once auth state is received
        
        if (firebaseUser) {
          try {
            const data = await getUserData(firebaseUser.uid)
            if (data) {
              setUserState(firebaseUser, data)
            } else {
              // User exists in Auth but not in Firestore
              clearUserState()
            }
          } catch (err) {
            console.error('Error fetching user data:', err)
            clearUserState()
          }
        } else {
          clearUserState()
        }
        isInitialized.value = true
        resolve()
      })

      // Store unsubscribe function for cleanup if needed
      return unsubscribe
    })
  }

  /**
   * Set user state from Firebase user and Firestore data
   */
  function setUserState(firebaseUser: FirebaseUser, data: User) {
    isLoggedIn.value = true
    userId.value = firebaseUser.uid
    userEmail.value = firebaseUser.email
    displayName.value = data.displayName || firebaseUser.displayName
    userRole.value = data.role
    userData.value = data
    token.value = firebaseUser.uid // Use Firebase UID as token
  }

  /**
   * Clear user state on logout
   */
  function clearUserState() {
    isLoggedIn.value = false
    userId.value = null
    userEmail.value = null
    displayName.value = null
    userRole.value = null
    userData.value = null
    token.value = null
    error.value = null
  }

  /**
   * Login with email and password
   */
  async function login(email: string, password: string): Promise<{ success: boolean; role?: UserRole }> {
    isLoading.value = true
    error.value = null

    try {
      console.log('Login attempt:', email)
      const { user, userData: data } = await loginWithEmailPassword(email, password)
      console.log('Login successful, user data:', data)
      setUserState(user, data)
      return { success: true, role: data.role }
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code)
      error.value = err.message || errorMessage
      console.error('Login error:', err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout current user
   */
  async function logout(): Promise<void> {
    isLoading.value = true
    try {
      await firebaseLogout()
      clearUserState()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile
   */
  async function updateUserProfile(data: {
    displayName?: string
    phone?: string
  }): Promise<boolean> {
    if (!userId.value) return false

    isLoading.value = true
    error.value = null

    try {
      await updateProfile(userId.value, data)
      
      // Update local state
      if (data.displayName) {
        displayName.value = data.displayName
      }
      if (userData.value) {
        userData.value = { ...userData.value, ...data }
      }
      
      return true
    } catch (err: any) {
      error.value = 'Failed to update profile'
      console.error('Update profile error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user notification settings
   */
  async function updateUserSettings(settings: Partial<UserSettings>): Promise<boolean> {
    if (!userId.value) return false

    isLoading.value = true
    error.value = null

    try {
      await updateSettings(userId.value, settings)
      
      // Update local state
      if (userData.value) {
        userData.value = {
          ...userData.value,
          settings: { ...userData.value.settings, ...settings },
        }
      }
      
      return true
    } catch (err: any) {
      error.value = 'Failed to update settings'
      console.error('Update settings error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change user password
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseChangePassword(currentPassword, newPassword)
      return true
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code)
      error.value = errorMessage
      console.error('Change password error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use initializeAuth() instead
   */
  function restoreSession(): boolean {
    // This is now handled by Firebase auth state observer
    return isLoggedIn.value
  }

  return {
    // State
    isLoggedIn,
    userRole,
    token,
    userEmail,
    userId,
    displayName,
    userData,
    isLoading,
    error,
    isInitialized,
    
    // Getters
    isAdmin,
    isTester,
    userSettings,
    userName,
    
    // State aliases for compatibility
    user: userData,
    
    // Actions
    initializeAuth,
    login,
    logout,
    updateUserProfile,
    updateUserSettings,
    changePassword,
    
    // Legacy (for backward compatibility during transition)
    restoreSession,
  }
})

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Email tidak valid',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan',
    'auth/user-not-found': 'Email tidak terdaftar',
    'auth/wrong-password': 'Password salah',
    'auth/email-already-in-use': 'Email sudah digunakan',
    'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter)',
    'auth/operation-not-allowed': 'Operasi tidak diizinkan',
    'auth/invalid-credential': 'Email atau password salah',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan coba lagi nanti',
    'auth/network-request-failed': 'Koneksi jaringan bermasalah',
  }

  return errorMessages[errorCode] || 'Terjadi kesalahan. Silakan coba lagi'
}

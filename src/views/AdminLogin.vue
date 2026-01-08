<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const localError = ref<string | null>(null)

// Computed property to show combined error
const errorMessage = computed(() => localError.value || authStore.error)

const handleLogin = async (e: Event) => {
  e.preventDefault()
  localError.value = null
  
  // Basic validation
  if (!email.value.trim()) {
    localError.value = 'Email tidak boleh kosong'
    return
  }
  
  if (!password.value) {
    localError.value = 'Password tidak boleh kosong'
    return
  }
  
  // Call Firebase login
  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    // Get redirect URL or default based on role
    const redirectUrl = route.query.redirect as string
    
    if (redirectUrl) {
      router.push(redirectUrl)
    } else if (result.role === 'admin') {
      router.push({ name: 'AdminDashboard' })
    } else if (result.role === 'tester') {
      router.push({ name: 'TesterPortal' })
    } else {
      router.push({ name: 'Home' })
    }
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#2563FF] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0">
      <div class="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Back Button -->
    <button 
      @click="goBack"
      class="absolute top-8 left-8 text-white/90 hover:text-white flex items-center gap-2 transition-all z-10"
    >
      <ArrowLeft :size="20" />
      <span>Kembali ke Beranda</span>
    </button>

    <!-- Login Card -->
    <div class="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md relative z-10 border border-gray-100">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-5 flex items-center justify-center shadow-lg">
          <ShieldCheck :size="32" class="text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Internal Employee Portal</h1>
        <p class="text-gray-600">Ordinat Cakrawala</p>
        <div class="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
          🔒 Employee Access Only
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-red-700">{{ errorMessage }}</div>
      </div>

      <!-- Login Form -->
      <form @submit="handleLogin" class="space-y-6">
        <div>
          <label class="block text-gray-700 font-medium mb-2">Email Karyawan</label>
          <Input
            v-model="email"
            type="email"
            placeholder="admin@ordinat.com"
            class="bg-gray-50 border-2 border-gray-200 h-12 px-4 focus:border-[#2563FF]"
            :disabled="authStore.isLoading"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">Password</label>
          <Input
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            class="bg-gray-50 border-2 border-gray-200 h-12 px-4 focus:border-[#2563FF]"
            :disabled="authStore.isLoading"
            required
          />
        </div>

        <!-- Role Info -->
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p class="text-sm text-gray-600">
            <strong>Info:</strong> Role akses (Admin/Tester) akan ditentukan secara otomatis berdasarkan akun yang terdaftar.
          </p>
        </div>

        <Button 
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-12 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LoadingSpinner v-if="authStore.isLoading" class="w-5 h-5 mr-2" />
          <span v-if="authStore.isLoading">Memproses...</span>
          <span v-else>Login</span>
        </Button>

        <p class="text-xs text-gray-500 text-center pt-2">
          ⚠️ Portal ini hanya untuk karyawan internal yang berwenang
        </p>
      </form>
    </div>
  </div>
</template>

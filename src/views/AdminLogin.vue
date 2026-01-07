<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const selectedRole = ref<'admin' | 'tester'>('admin')

const handleLogin = (e: Event) => {
  e.preventDefault()
  
  // Mock login - in production, this would call an API
  authStore.login(selectedRole.value, email.value)
  
  // Navigate to appropriate dashboard
  if (selectedRole.value === 'admin') {
    router.push({ name: 'AdminDashboard' })
  } else {
    router.push({ name: 'TesterPortal' })
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

      <!-- Login Form -->
      <form @submit="handleLogin" class="space-y-6">
        <div>
          <label class="block text-gray-700 font-medium mb-2">Email Karyawan</label>
          <Input
            v-model="email"
            type="email"
            placeholder="admin@ordinat.com"
            class="bg-gray-50 border-2 border-gray-200 h-12 px-4 focus:border-[#2563FF]"
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
            required
          />
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-gray-700 font-medium mb-3">Role Karyawan</label>
          <div class="space-y-3">
            <!-- Admin Role -->
            <button
              type="button"
              @click="selectedRole = 'admin'"
              :class="[
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selectedRole === 'admin'
                  ? 'border-[#2563FF] bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              ]"
            >
              <div class="flex items-start gap-3">
                <div :class="[
                  'w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0',
                  selectedRole === 'admin' 
                    ? 'border-[#2563FF] bg-[#2563FF]' 
                    : 'border-gray-300'
                ]">
                  <div v-if="selectedRole === 'admin'" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 mb-1">Admin</div>
                  <div class="text-sm text-gray-600">
                    Kelola registrasi peserta dan upload hasil psikotes
                  </div>
                </div>
              </div>
            </button>

            <!-- Tester Role -->
            <button
              type="button"
              @click="selectedRole = 'tester'"
              :class="[
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selectedRole === 'tester'
                  ? 'border-[#7C3AED] bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              ]"
            >
              <div class="flex items-start gap-3">
                <div :class="[
                  'w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0',
                  selectedRole === 'tester' 
                    ? 'border-[#7C3AED] bg-[#7C3AED]' 
                    : 'border-gray-300'
                ]">
                  <div v-if="selectedRole === 'tester'" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 mb-1">Tester</div>
                  <div class="text-sm text-gray-600">
                    Verifikasi data peserta saat sesi psikotes di sekolah
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <Button 
          type="submit"
          class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-12 font-semibold shadow-lg"
        >
          Login sebagai {{ selectedRole === 'admin' ? 'Admin' : 'Tester' }}
        </Button>

        <p class="text-xs text-gray-500 text-center pt-2">
          ⚠️ Portal ini hanya untuk karyawan internal yang berwenang
        </p>
      </form>
    </div>
  </div>
</template>

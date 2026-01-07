<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { Users, Briefcase, Download, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()

const navigateToUserPortal = () => {
  router.push({ name: 'UserPortal' })
}

const navigateToEmployeePortal = () => {
  router.push({ name: 'AdminLogin' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#2563FF] via-[#4F46E5] to-[#7C3AED] relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0">
      <div class="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 py-12">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/30 shadow-xl">
          <span class="text-white font-bold text-3xl">OC</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Ordinat Cakrawala
        </h1>
        <p class="text-xl md:text-2xl text-white/90">
          Psychology Consulting Services
        </p>
      </div>

      <!-- Two Portal Options -->
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mt-16">
        <!-- Public User Portal -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-10 hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-gray-100 hover:border-blue-300 group">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-5 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Download :size="32" class="text-white" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              Download Psychotest Result Portal
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Portal untuk peserta dan lembaga yang ingin mengunduh hasil psikotes
            </p>
          </div>

          <div class="space-y-4 mb-8">
            <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100 hover:translate-x-1">
              <Users :size="20" class="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold text-gray-900 text-sm">CPMI (Calon Pekerja Migran Indonesia)</div>
                <div class="text-xs text-gray-600">Individual applicants</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100 hover:translate-x-1">
              <Briefcase :size="20" class="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold text-gray-900 text-sm">Instansi / Lembaga / Sekolah</div>
                <div class="text-xs text-gray-600">Organizations & institutions</div>
              </div>
            </div>
          </div>

          <Button
            @click="navigateToUserPortal"
            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-14 font-semibold shadow-lg text-base"
          >
            Enter User Portal
          </Button>

          <p class="text-xs text-gray-500 text-center mt-4">
            🔐 Token-based secure access
          </p>
        </div>

        <!-- Employee Portal -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-10 hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-gray-100 hover:border-purple-300 group">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-5 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <ShieldCheck :size="32" class="text-white" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              Internal Employee Portal
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Portal khusus untuk petugas internal Ordinat Cakrawala
            </p>
          </div>

          <div class="space-y-4 mb-8">
            <div class="flex items-start gap-3 p-3 bg-purple-50 rounded-lg transition-all duration-300 hover:bg-purple-100 hover:translate-x-1">
              <ShieldCheck :size="20" class="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold text-gray-900 text-sm">Admin</div>
                <div class="text-xs text-gray-600">Manage registrations & upload results</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-purple-50 rounded-lg transition-all duration-300 hover:bg-purple-100 hover:translate-x-1">
              <Users :size="20" class="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold text-gray-900 text-sm">Tester</div>
                <div class="text-xs text-gray-600">Verify participant data during sessions</div>
              </div>
            </div>
          </div>

          <Button
            @click="navigateToEmployeePortal"
            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-14 font-semibold shadow-lg text-base"
          >
            Employee Login
          </Button>

          <p class="text-xs text-gray-500 text-center mt-4">
            🔒 Employee access only
          </p>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="text-center mt-16">
        <p class="text-white/80 text-sm">
          Ordinat Cakrawala © 2026 | Professional Psychology Consulting
        </p>
      </div>
    </div>
  </div>
</template>

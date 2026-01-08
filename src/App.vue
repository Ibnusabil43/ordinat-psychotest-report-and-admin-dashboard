<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const isAppReady = ref(false)

onMounted(async () => {
  // Initialize Firebase auth state listener
  await authStore.initializeAuth()
  isAppReady.value = true
})
</script>

<template>
  <!-- Loading state while initializing auth -->
  <div v-if="!isAppReady" class="min-h-screen bg-gradient-to-br from-[#2563FF] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
    <div class="text-center">
      <LoadingSpinner class="w-12 h-12 text-white mx-auto mb-4" />
      <p class="text-white/80 text-sm">Memuat aplikasi...</p>
    </div>
  </div>

  <!-- Main app content -->
  <div v-else class="min-h-screen bg-background">
    <RouterView v-slot="{ Component, route }">
      <Transition 
        :name="route.meta.transition as string || 'fade'"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>

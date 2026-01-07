<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LayoutDashboard, UserPlus, Upload, Settings, LogOut, Menu, X } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'registration', label: 'Registrasi Peserta', icon: UserPlus, path: '/admin/registration' },
  { id: 'upload', label: 'Upload Hasil Psikotes', icon: Upload, path: '/admin/upload' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, path: '/admin/settings' },
];

const isActive = (path: string) => {
  return route.path === path;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/admin/login');
};

const navigate = (path: string) => {
  router.push(path);
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <!-- Mobile Menu Button -->
  <button
    @click="isMobileMenuOpen = !isMobileMenuOpen"
    class="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center shadow-lg"
  >
    <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
    <X v-else class="w-5 h-5" />
  </button>

  <!-- Overlay -->
  <div
    v-if="isMobileMenuOpen"
    @click="isMobileMenuOpen = false"
    class="md:hidden fixed inset-0 bg-black/50 z-40"
  ></div>

  <!-- Sidebar -->
  <div :class="[
    'w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-40 transition-transform duration-300',
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-[#2563FF] to-[#7C3AED] rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6">
          <span class="font-bold">OC</span>
        </div>
        <div>
          <div class="font-bold text-sm">Ordinat Cakrawala</div>
          <div class="text-xs text-gray-400">Admin Panel</div>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <nav class="flex-1 p-4 space-y-1">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="navigate(item.path)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm transform hover:translate-x-1',
          isActive(item.path)
            ? 'bg-gradient-to-r from-[#2563FF] to-[#7C3AED] text-white shadow-lg scale-105'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Logout Button -->
    <div class="p-4 border-t border-gray-800">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-300 text-sm hover:translate-x-1"
      >
        <LogOut class="w-5 h-5 transition-transform duration-300 hover:scale-110" />
        <span>Keluar</span>
      </button>
    </div>
  </div>
</template>

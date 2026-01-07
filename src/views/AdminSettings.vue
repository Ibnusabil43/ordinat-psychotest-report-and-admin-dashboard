<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { User, Lock, Bell, Save, Shield, Eye, EyeOff, Mail } from 'lucide-vue-next';

const authStore = useAuthStore();

const showPassword = ref(false);
const profileData = ref({
  namaLengkap: 'Admin Utama',
  email: 'admin@ordinat.com',
  phone: '+62 812 3456 7890',
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const notificationSettings = ref({
  emailNotif: true,
  uploadNotif: true,
  registrationNotif: false,
});

const saveStatus = ref<'idle' | 'success'>('idle');

const handleSaveProfile = () => {
  saveStatus.value = 'success';
  setTimeout(() => saveStatus.value = 'idle', 2000);
};

const handleChangePassword = () => {
  saveStatus.value = 'success';
  setTimeout(() => {
    saveStatus.value = 'idle';
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }, 2000);
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />
    
    <div class="md:ml-64 flex-1">
      <!-- Top Bar -->
      <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10">
        <div class="ml-12 md:ml-0">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">Kelola profil dan preferensi akun admin</p>
        </div>
        <div class="hidden md:flex items-center gap-3">
          <div class="text-right">
            <div class="text-sm font-semibold text-gray-900">Admin Utama</div>
            <div class="text-xs text-gray-500">{{ authStore.userEmail }}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-4 md:p-8 max-w-5xl">
        <div class="space-y-4 md:space-y-6">
          <!-- Profile Settings -->
          <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <User class="w-4 h-4 md:w-5 md:h-5 text-white" />
              <h2 class="text-base md:text-lg font-bold text-white">Informasi Profil</h2>
            </div>
            <form @submit.prevent="handleSaveProfile" class="p-4 md:p-6 space-y-4 md:space-y-6">
              <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Nama Lengkap</label>
                  <Input
                    v-model="profileData.namaLengkap"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                  <Input
                    v-model="profileData.email"
                    type="email"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Nomor Telepon</label>
                <Input
                  v-model="profileData.phone"
                  class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                />
              </div>
              <Button 
                type="submit"
                class="w-full md:w-auto bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 px-6 md:px-8 font-semibold min-h-[44px] md:min-h-0 text-sm md:text-base"
              >
                <Save class="w-4 h-4 md:mr-2" />
                <span class="ml-2 md:ml-0">Simpan Perubahan</span>
              </Button>
            </form>
          </div>

          <!-- Password Settings -->
          <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <Lock class="w-4 h-4 md:w-5 md:h-5 text-white" />
              <h2 class="text-base md:text-lg font-bold text-white">Keamanan Password</h2>
            </div>
            <form @submit.prevent="handleChangePassword" class="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Password Saat Ini</label>
                <div class="relative">
                  <Input
                    v-model="passwordData.currentPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 pr-12 focus:border-[#2563FF] text-sm md:text-base"
                    placeholder="Masukkan password lama"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                  >
                    <EyeOff v-if="showPassword" class="w-5 h-5" />
                    <Eye v-else class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Password Baru</label>
                  <Input
                    v-model="passwordData.newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Konfirmasi Password Baru</label>
                  <Input
                    v-model="passwordData.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                class="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white h-11 md:h-12 px-6 md:px-8 font-semibold min-h-[44px] md:min-h-0 text-sm md:text-base"
              >
                <Shield class="w-4 h-4 md:mr-2" />
                <span class="ml-2 md:ml-0">Update Password</span>
              </Button>
            </form>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <Bell class="w-4 h-4 md:w-5 md:h-5 text-white" />
              <h2 class="text-base md:text-lg font-bold text-white">Preferensi Notifikasi</h2>
            </div>
            <div class="p-4 md:p-6 space-y-3 md:space-y-4">
              <div class="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <Mail class="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 text-sm md:text-base">Email Notifikasi</div>
                    <div class="text-xs md:text-sm text-gray-500">Terima pemberitahuan via email</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                  <input
                    v-model="notificationSettings.emailNotif"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2563FF] peer-checked:to-[#7C3AED]"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <Bell class="w-5 h-5 text-gray-600" />
                  <div>
                    <div class="font-medium text-gray-900">Upload File Baru</div>
                    <div class="text-sm text-gray-500">Notifikasi saat ada upload hasil psikotes</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="notificationSettings.uploadNotif"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2563FF] peer-checked:to-[#7C3AED]"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <User class="w-5 h-5 text-gray-600" />
                  <div>
                    <div class="font-medium text-gray-900">Registrasi Peserta Baru</div>
                    <div class="text-sm text-gray-500">Notifikasi saat ada pendaftaran baru</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="notificationSettings.registrationNotif"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2563FF] peer-checked:to-[#7C3AED]"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Informasi Sistem</h3>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Versi Aplikasi:</span>
                <span class="font-medium text-gray-900">v2.1.0</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Last Login:</span>
                <span class="font-medium text-gray-900">7 Jan 2026, 10:30</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Role:</span>
                <span class="font-medium text-gray-900">Super Admin</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium text-green-600">● Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

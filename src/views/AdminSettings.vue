<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { User, Lock, Bell, Save, Shield, Eye, EyeOff, Mail, CheckCircle, XCircle } from 'lucide-vue-next';
import { updateUserProfile, changePassword, updateUserSettings, getUserSettings } from '@/services/authService';
// UserSettings type is used in authService

const authStore = useAuthStore();

const showPassword = ref(false);
const isLoadingProfile = ref(false);
const isLoadingPassword = ref(false);
const isLoadingSettings = ref(true);
const profileError = ref<string | null>(null);
const profileSuccess = ref(false);
const passwordError = ref<string | null>(null);
const passwordSuccess = ref(false);

// Profile data - initialized from auth store
const profileData = ref({
  namaLengkap: '',
  email: '',
  phone: '',
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

// Computed for last login display
const lastLoginDisplay = computed(() => {
  // This would ideally come from Firebase Auth metadata
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Load user data on mount
onMounted(async () => {
  // Initialize profile data from auth store
  profileData.value = {
    namaLengkap: authStore.userName || 'Admin',
    email: authStore.userEmail || '',
    phone: '',
  };
  
  // Load notification settings from Firestore
  if (authStore.userId) {
    try {
      const settings = await getUserSettings(authStore.userId);
      if (settings) {
        notificationSettings.value = {
          emailNotif: settings.emailNotifications ?? true,
          uploadNotif: settings.uploadNotifications ?? true,
          registrationNotif: settings.registrationNotifications ?? false,
        };
        profileData.value.phone = settings.phone || '';
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  }
  isLoadingSettings.value = false;
});

// Save profile to Firebase
const handleSaveProfile = async () => {
  isLoadingProfile.value = true;
  profileError.value = null;
  profileSuccess.value = false;
  
  try {
    if (!authStore.userId) throw new Error('User not authenticated');
    
    // Update auth profile
    await updateUserProfile(authStore.userId, {
      displayName: profileData.value.namaLengkap,
      phone: profileData.value.phone,
    });
    
    // Update user settings in Firestore
    await updateUserSettings(authStore.userId, {
      phone: profileData.value.phone,
      emailNotifications: notificationSettings.value.emailNotif,
      uploadNotifications: notificationSettings.value.uploadNotif,
      registrationNotifications: notificationSettings.value.registrationNotif,
    });
    
    // Update auth store displayName
    if (authStore.user) {
      authStore.user.displayName = profileData.value.namaLengkap;
    }
    
    profileSuccess.value = true;
    setTimeout(() => profileSuccess.value = false, 3000);
  } catch (error: any) {
    console.error('Failed to save profile:', error);
    profileError.value = error.message || 'Gagal menyimpan perubahan profil';
  } finally {
    isLoadingProfile.value = false;
  }
};

// Change password
const handleChangePassword = async () => {
  // Validation
  if (!passwordData.value.currentPassword) {
    passwordError.value = 'Password saat ini harus diisi';
    return;
  }
  if (passwordData.value.newPassword.length < 6) {
    passwordError.value = 'Password baru minimal 6 karakter';
    return;
  }
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Konfirmasi password tidak cocok';
    return;
  }
  
  isLoadingPassword.value = true;
  passwordError.value = null;
  passwordSuccess.value = false;
  
  try {
    await changePassword(
      passwordData.value.currentPassword,
      passwordData.value.newPassword
    );
    
    passwordSuccess.value = true;
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    setTimeout(() => passwordSuccess.value = false, 3000);
  } catch (error: any) {
    console.error('Failed to change password:', error);
    if (error.code === 'auth/wrong-password') {
      passwordError.value = 'Password saat ini salah';
    } else if (error.code === 'auth/weak-password') {
      passwordError.value = 'Password baru terlalu lemah';
    } else {
      passwordError.value = error.message || 'Gagal mengubah password';
    }
  } finally {
    isLoadingPassword.value = false;
  }
};

// Save notification settings when toggled
const handleNotificationChange = async () => {
  if (!authStore.userId) return;
  
  try {
    await updateUserSettings(authStore.userId, {
      emailNotifications: notificationSettings.value.emailNotif,
      uploadNotifications: notificationSettings.value.uploadNotif,
      registrationNotifications: notificationSettings.value.registrationNotif,
    });
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
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
              <!-- Success/Error Messages -->
              <div v-if="profileSuccess" class="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle class="w-4 h-4 flex-shrink-0" />
                <span class="text-sm">Profil berhasil disimpan!</span>
              </div>
              <div v-if="profileError" class="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <XCircle class="w-4 h-4 flex-shrink-0" />
                <span class="text-sm">{{ profileError }}</span>
              </div>
              
              <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Nama Lengkap</label>
                  <Input
                    v-model="profileData.namaLengkap"
                    :disabled="isLoadingProfile"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base disabled:opacity-50"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                  <Input
                    v-model="profileData.email"
                    type="email"
                    disabled
                    class="bg-gray-100 border-2 border-gray-300 h-11 md:h-12 px-4 text-sm md:text-base cursor-not-allowed"
                  />
                  <p class="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Nomor Telepon</label>
                <Input
                  v-model="profileData.phone"
                  :disabled="isLoadingProfile"
                  class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base disabled:opacity-50"
                />
              </div>
              <Button 
                type="submit"
                :disabled="isLoadingProfile"
                class="w-full md:w-auto bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 px-6 md:px-8 font-semibold min-h-[44px] md:min-h-0 text-sm md:text-base disabled:opacity-50"
              >
                <LoadingSpinner v-if="isLoadingProfile" class="w-4 h-4" />
                <Save v-else class="w-4 h-4 md:mr-2" />
                <span class="ml-2 md:ml-0">{{ isLoadingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
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
              <!-- Success/Error Messages -->
              <div v-if="passwordSuccess" class="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle class="w-4 h-4 flex-shrink-0" />
                <span class="text-sm">Password berhasil diubah!</span>
              </div>
              <div v-if="passwordError" class="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <XCircle class="w-4 h-4 flex-shrink-0" />
                <span class="text-sm">{{ passwordError }}</span>
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Password Saat Ini</label>
                <div class="relative">
                  <Input
                    v-model="passwordData.currentPassword"
                    :type="showPassword ? 'text' : 'password'"
                    :disabled="isLoadingPassword"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 pr-12 focus:border-[#2563FF] text-sm md:text-base disabled:opacity-50"
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
                    :disabled="isLoadingPassword"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base disabled:opacity-50"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Konfirmasi Password Baru</label>
                  <Input
                    v-model="passwordData.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    :disabled="isLoadingPassword"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base disabled:opacity-50"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                :disabled="isLoadingPassword"
                class="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white h-11 md:h-12 px-6 md:px-8 font-semibold min-h-[44px] md:min-h-0 text-sm md:text-base disabled:opacity-50"
              >
                <LoadingSpinner v-if="isLoadingPassword" class="w-4 h-4" />
                <Shield v-else class="w-4 h-4 md:mr-2" />
                <span class="ml-2 md:ml-0">{{ isLoadingPassword ? 'Memperbarui...' : 'Update Password' }}</span>
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
                    @change="handleNotificationChange"
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
                    @change="handleNotificationChange"
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
                    @change="handleNotificationChange"
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
                <span class="font-medium text-gray-900">{{ lastLoginDisplay }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Role:</span>
                <span class="font-medium text-gray-900 capitalize">{{ authStore.userRole || 'Admin' }}</span>
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

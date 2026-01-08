<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-vue-next';
import { 
  createParticipant, 
  generateParticipantToken, 
  getRecentParticipants 
} from '@/services/participantService';
import { 
  createInstitution, 
  generateInstitutionToken, 
  getRecentInstitutions 
} from '@/services/institutionService';
import { logRegistration } from '@/services/activityService';
import type { Participant, Institution } from '@/types/models';
import { Timestamp } from 'firebase/firestore';

const authStore = useAuthStore();

const registrationType = ref<'cpmi' | 'instansi'>('cpmi');
const formData = ref({
  namaLengkap: '',
  tempatTanggalLahir: '',
  pendidikan: '',
  nik: '',
  namaInstansi: '',
  token: ''
});

// Loading states
const isSubmitting = ref(false);
const isLoadingRecent = ref(true);
const submitSuccess = ref(false);
const submitError = ref<string | null>(null);

// Recent registrations
const recentRegistrations = ref<Array<{
  nama: string;
  tipe: string;
  token: string;
  tanggal: string;
}>>([]);

// Format timestamp to readable date
function formatDate(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return '-';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Generate token based on type
const generateToken = () => {
  formData.value.token = registrationType.value === 'cpmi' 
    ? generateParticipantToken() 
    : generateInstitutionToken();
};

// Initialize token on mount
onMounted(async () => {
  generateToken();
  await loadRecentRegistrations();
});

// Load recent registrations
async function loadRecentRegistrations() {
  isLoadingRecent.value = true;
  
  try {
    const [participants, institutions] = await Promise.all([
      getRecentParticipants(3),
      getRecentInstitutions(2)
    ]);
    
    const combined = [
      ...participants.map((p: Participant) => ({
        nama: p.namaLengkap,
        tipe: 'CPMI',
        token: p.token,
        tanggal: formatDate(p.createdAt)
      })),
      ...institutions.map((i: Institution) => ({
        nama: i.namaInstansi,
        tipe: 'Instansi',
        token: i.token,
        tanggal: formatDate(i.createdAt)
      }))
    ];
    
    // Sort by date (most recent first) and take first 5
    recentRegistrations.value = combined.slice(0, 5);
  } catch (error) {
    console.error('Error loading recent registrations:', error);
  } finally {
    isLoadingRecent.value = false;
  }
}

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true;
  submitSuccess.value = false;
  submitError.value = null;
  
  try {
    const userId = authStore.userId || 'unknown';
    
    if (registrationType.value === 'cpmi') {
      // Create participant
      const participant = await createParticipant({
        namaLengkap: formData.value.namaLengkap,
        tempatTanggalLahir: formData.value.tempatTanggalLahir,
        pendidikan: formData.value.pendidikan,
        nik: formData.value.nik,
        token: formData.value.token
      }, userId);
      
      // Log activity
      await logRegistration(
        participant.namaLengkap,
        'cpmi',
        participant.token,
        userId,
        participant.id
      );
    } else {
      // Create institution
      const institution = await createInstitution({
        namaInstansi: formData.value.namaInstansi,
        token: formData.value.token
      }, userId);
      
      // Log activity
      await logRegistration(
        institution.namaInstansi,
        'instansi',
        institution.token,
        userId,
        institution.id
      );
    }
    
    submitSuccess.value = true;
    
    // Reset form
    resetForm();
    
    // Reload recent registrations
    await loadRecentRegistrations();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
    
  } catch (error: any) {
    console.error('Error creating registration:', error);
    submitError.value = error.message || 'Gagal menyimpan data. Silakan coba lagi.';
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form fields
function resetForm() {
  formData.value = {
    namaLengkap: '',
    tempatTanggalLahir: '',
    pendidikan: '',
    nik: '',
    namaInstansi: '',
    token: ''
  };
  generateToken();
}

// Handle type change
const handleTypeChange = (value: string) => {
  registrationType.value = value as 'cpmi' | 'instansi';
  resetForm();
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />
    
    <div class="md:ml-64 flex-1">
      <!-- Top Bar -->
      <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10">
        <div class="ml-12 md:ml-0">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Registrasi Peserta</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">Daftarkan CPMI atau instansi untuk menerima token akses</p>
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
      <div class="p-4 md:p-8 max-w-6xl">
        <!-- Success/Error Messages -->
        <div v-if="submitSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
          <span class="text-sm text-green-700">Data berhasil disimpan!</span>
        </div>
        
        <div v-if="submitError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0" />
          <span class="text-sm text-red-700">{{ submitError }}</span>
        </div>
        
        <!-- Registration Form Card -->
        <div class="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-8 mb-6 md:mb-8">
          <form @submit.prevent="handleSubmit">
            <!-- Type Selector -->
            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-3 text-sm md:text-base">Tipe Pendaftaran</label>
              <Select
                v-model="registrationType"
                @update:model-value="handleTypeChange"
                :disabled="isSubmitting"
                class="w-full bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 rounded-md hover:border-[#2563FF] transition-colors text-sm md:text-base"
              >
                <option value="cpmi">CPMI (Calon Pekerja Migran Indonesia)</option>
                <option value="instansi">Instansi / Lembaga / Sekolah</option>
              </Select>
            </div>

            <!-- Conditional Fields - CPMI -->
            <div v-if="registrationType === 'cpmi'" class="space-y-4 md:space-y-6">
              <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Nama lengkap</label>
                  <Input
                    v-model="formData.namaLengkap"
                    placeholder="Masukkan nama lengkap"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    :disabled="isSubmitting"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Tempat tanggal lahir</label>
                  <Input
                    v-model="formData.tempatTanggalLahir"
                    placeholder="Jakarta, 15 Januari 1990"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    :disabled="isSubmitting"
                    required
                  />
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Pendidikan terakhir</label>
                  <Input
                    v-model="formData.pendidikan"
                    placeholder="SMA / SMK / D3 / S1"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    :disabled="isSubmitting"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">NIK / Nomor Paspor</label>
                  <Input
                    v-model="formData.nik"
                    placeholder="Masukkan NIK atau nomor paspor"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                    :disabled="isSubmitting"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Unique token</label>
                <div class="flex gap-2 md:gap-3">
                  <Input
                    v-model="formData.token"
                    readonly
                    class="bg-gray-100 border-2 border-gray-300 h-11 md:h-12 px-3 md:px-4 flex-1 font-mono text-xs md:text-base"
                  />
                  <Button
                    type="button"
                    @click="generateToken"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 min-h-[44px] md:min-h-0 text-sm md:text-base"
                  >
                    <RefreshCw class="w-4 h-4 md:mr-2" />
                    <span class="hidden md:inline">Generate</span>
                  </Button>
                </div>
              </div>

              <Button 
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 font-semibold text-sm md:text-base min-h-[44px] md:min-h-0 disabled:opacity-50"
              >
                <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 mr-2" />
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Peserta' }}
              </Button>
            </div>

            <!-- Conditional Fields - Instansi -->
            <div v-else class="space-y-4 md:space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Nama instansi / lembaga / sekolah</label>
                <Input
                  v-model="formData.namaInstansi"
                  placeholder="Masukkan nama instansi"
                  class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
                  :disabled="isSubmitting"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 text-sm">Unique token</label>
                <div class="flex gap-2 md:gap-3">
                  <Input
                    v-model="formData.token"
                    readonly
                    class="bg-gray-100 border-2 border-gray-300 h-11 md:h-12 px-3 md:px-4 flex-1 font-mono text-xs md:text-base"
                  />
                  <Button
                    type="button"
                    @click="generateToken"
                    :disabled="isSubmitting"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 min-h-[44px] md:min-h-0 text-sm md:text-base"
                  >
                    <RefreshCw class="w-4 h-4 md:mr-2" />
                    <span class="hidden md:inline">Generate</span>
                  </Button>
                </div>
              </div>

              <Button 
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 font-semibold text-sm md:text-base min-h-[44px] md:min-h-0 disabled:opacity-50"
              >
                <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 mr-2" />
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Instansi' }}
              </Button>
            </div>
          </form>
        </div>

        <!-- Recent Registrations -->
        <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4">
            <h2 class="text-base md:text-lg font-bold text-white">5 Registrasi Terakhir</h2>
          </div>
          
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipe</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Token</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(reg, idx) in recentRegistrations"
                  :key="idx"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ reg.nama }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex px-3 py-1 rounded-md text-xs font-medium',
                      reg.tipe === 'CPMI' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    ]">
                      {{ reg.tipe }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ reg.token }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ reg.tanggal }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="md:hidden divide-y divide-gray-200">
            <div
              v-for="(reg, idx) in recentRegistrations"
              :key="idx"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="font-medium text-gray-900 text-sm">{{ reg.nama }}</div>
                <span :class="[
                  'inline-flex px-2 py-0.5 rounded-md text-xs font-medium',
                  reg.tipe === 'CPMI' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                ]">
                  {{ reg.tipe }}
                </span>
              </div>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Token:</span>
                  <span class="text-gray-900 font-mono text-xs">{{ reg.token }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Tanggal:</span>
                  <span class="text-gray-900 font-medium">{{ reg.tanggal }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

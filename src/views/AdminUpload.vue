<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { Upload as UploadIcon, Search, FileText, X, CheckCircle, XCircle } from 'lucide-vue-next';
import { searchParticipants, getParticipantByToken } from '@/services/participantService';
import { searchInstitutions, getInstitutionByToken } from '@/services/institutionService';
import { uploadPsychotestResult, type UploadProgress } from '@/services/resultsService';
import { logUpload } from '@/services/activityService';
import type { Participant, Institution, EntityType } from '@/types/models';

const authStore = useAuthStore();

const category = ref<EntityType>('cpmi');
const searchQuery = ref('');
const selectedParticipant = ref<{
  id: string;
  nama: string;
  token: string;
  jenisTest: string;
  tanggalTest: string;
  type: EntityType;
} | null>(null);
const uploadedFile = ref<File | null>(null);
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle');
const uploadProgress = ref(0);
const errorMessage = ref<string | null>(null);
const isSearching = ref(false);
const searchResults = ref<Array<{ id: string; nama: string; token: string }>>([]);

// Search for participants or institutions
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  isSearching.value = true;
  searchResults.value = [];
  selectedParticipant.value = null;
  errorMessage.value = null;
  
  try {
    if (category.value === 'cpmi') {
      // First try to find by token
      const byToken = await getParticipantByToken(searchQuery.value.trim());
      if (byToken) {
        selectEntity(byToken, 'cpmi');
        return;
      }
      
      // Search by name/NIK
      const results = await searchParticipants(searchQuery.value.trim(), 5);
      if (results.length === 1 && results[0]) {
        selectEntity(results[0], 'cpmi');
      } else if (results.length > 1) {
        searchResults.value = results.map(p => ({
          id: p.id || '',
          nama: p.namaLengkap,
          token: p.token
        }));
      } else {
        errorMessage.value = 'Peserta tidak ditemukan';
      }
    } else {
      // First try to find by token
      const byToken = await getInstitutionByToken(searchQuery.value.trim());
      if (byToken) {
        selectEntity(byToken, 'instansi');
        return;
      }
      
      // Search by name
      const results = await searchInstitutions(searchQuery.value.trim(), 5);
      if (results.length === 1 && results[0]) {
        selectEntity(results[0], 'instansi');
      } else if (results.length > 1) {
        searchResults.value = results.map(i => ({
          id: i.id || '',
          nama: i.namaInstansi,
          token: i.token
        }));
      } else {
        errorMessage.value = 'Instansi tidak ditemukan';
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    errorMessage.value = 'Terjadi kesalahan saat mencari data';
  } finally {
    isSearching.value = false;
  }
};

// Select an entity from search results
const selectEntity = (entity: Participant | Institution, type: EntityType) => {
  const nama = type === 'cpmi' 
    ? (entity as Participant).namaLengkap 
    : (entity as Institution).namaInstansi;
  
  selectedParticipant.value = {
    id: entity.id || '',
    nama,
    token: entity.token,
    jenisTest: 'Psikotes Karyawan',
    tanggalTest: new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    type
  };
  searchResults.value = [];
};

// Handle file selection
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      errorMessage.value = 'Hanya file PDF yang diizinkan';
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file maksimal 10MB';
      return;
    }
    
    uploadedFile.value = file;
    errorMessage.value = null;
  }
};

// Handle file upload
const handleUpload = async () => {
  if (!uploadedFile.value || !selectedParticipant.value) {
    errorMessage.value = 'Pilih file terlebih dahulu';
    return;
  }
  
  uploadStatus.value = 'uploading';
  uploadProgress.value = 0;
  errorMessage.value = null;
  
  try {
    const userId = authStore.userId || 'unknown';
    
    // Upload to Firebase Storage and create Firestore document
    const result = await uploadPsychotestResult(
      uploadedFile.value,
      selectedParticipant.value.type,
      selectedParticipant.value.id,
      selectedParticipant.value.nama,
      selectedParticipant.value.token,
      selectedParticipant.value.jenisTest,
      new Date(),
      userId,
      (progress: UploadProgress) => {
        uploadProgress.value = progress.progress;
      }
    );
    
    // Log activity
    await logUpload(
      selectedParticipant.value.nama,
      selectedParticipant.value.type,
      selectedParticipant.value.token,
      userId,
      result.id,
      uploadedFile.value.name
    );
    
    uploadStatus.value = 'success';
    
    // Reset after success
    setTimeout(() => {
      handleCancel();
    }, 2000);
    
  } catch (error: any) {
    console.error('Upload error:', error);
    uploadStatus.value = 'error';
    errorMessage.value = error.message || 'Gagal mengupload file';
  }
};

// Cancel and reset form
const handleCancel = () => {
  uploadedFile.value = null;
  selectedParticipant.value = null;
  searchQuery.value = '';
  searchResults.value = [];
  uploadStatus.value = 'idle';
  uploadProgress.value = 0;
  errorMessage.value = null;
};

// Handle category change
const handleCategoryChange = (value: string) => {
  category.value = value as EntityType;
  handleCancel();
};

// Select a search result by token
const handleSelectSearchResult = async (token: string, type: EntityType) => {
  try {
    if (type === 'cpmi') {
      const p = await getParticipantByToken(token);
      if (p) selectEntity(p, 'cpmi');
    } else {
      const i = await getInstitutionByToken(token);
      if (i) selectEntity(i, 'instansi');
    }
  } catch (error) {
    console.error('Error selecting result:', error);
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
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Upload Hasil Psikotes</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">Pilih peserta dan unggah file hasil psikotes</p>
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
        <div class="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-8">
          <!-- Category Selector -->
          <div class="mb-4 md:mb-6">
            <label class="block text-gray-700 font-semibold mb-2 md:mb-3 text-sm md:text-base">Kategori</label>
            <Select
              v-model="category"
              @update:model-value="handleCategoryChange"
              class="w-full bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 rounded-md hover:border-[#2563FF] transition-colors text-sm md:text-base"
            >
              <option value="cpmi">CPMI</option>
              <option value="instansi">Instansi / Lembaga / Sekolah</option>
            </Select>
          </div>

          <!-- Search Panel -->
          <div class="mb-4 md:mb-6">
            <label class="block text-gray-700 font-medium mb-2 md:mb-3 text-sm md:text-base">
              {{ category === 'cpmi' ? 'Cari Peserta' : 'Cari Instansi' }}
            </label>
            <div class="flex gap-2 md:gap-3">
              <Input
                v-model="searchQuery"
                :placeholder="category === 'cpmi' 
                  ? 'Cari berdasarkan nama, NIK, atau token'
                  : 'Cari berdasarkan nama instansi atau token'"
                class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-3 md:px-4 focus:border-[#2563FF] flex-1 text-sm md:text-base"
                :disabled="isSearching || uploadStatus === 'uploading'"
                @keyup.enter="handleSearch"
              />
              <Button
                @click="handleSearch"
                :disabled="isSearching || !searchQuery.trim() || uploadStatus === 'uploading'"
                class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white px-4 md:px-8 min-h-[44px] md:min-h-0 text-sm md:text-base disabled:opacity-50"
              >
                <LoadingSpinner v-if="isSearching" class="w-4 h-4" />
                <Search v-else class="w-4 h-4 md:mr-2" />
                <span class="hidden md:inline">{{ isSearching ? 'Mencari...' : 'Cari' }}</span>
              </Button>
            </div>
            
            <!-- Search Results List -->
            <div v-if="searchResults.length > 0" class="mt-3 border-2 border-gray-200 rounded-xl overflow-hidden">
              <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span class="text-sm text-gray-600">Pilih dari hasil pencarian:</span>
              </div>
              <div class="max-h-48 overflow-y-auto">
                <button
                  v-for="result in searchResults"
                  :key="result.id"
                  @click="handleSelectSearchResult(result.token, category)"
                  class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div class="font-medium text-gray-900">{{ result.nama }}</div>
                  <div class="text-xs text-gray-500 font-mono">{{ result.token }}</div>
                </button>
              </div>
            </div>
            
            <!-- Error Message -->
            <div v-if="errorMessage && !selectedParticipant" class="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <XCircle class="w-4 h-4 flex-shrink-0" />
              <span class="text-sm">{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Selected Participant Summary -->          <!-- Selected Participant Summary -->
          <div v-if="selectedParticipant" class="mb-4 md:mb-6 p-4 md:p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h3 class="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Data Terpilih</h3>
            <div class="grid sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <div class="text-xs md:text-sm text-gray-600 mb-1">
                  {{ category === 'cpmi' ? 'Nama' : 'Nama Instansi' }}
                </div>
                <div class="font-medium text-gray-900 text-sm md:text-base">{{ selectedParticipant.nama }}</div>
              </div>
              <div>
                <div class="text-xs md:text-sm text-gray-600 mb-1">Token</div>
                <div class="font-medium text-gray-900 font-mono text-xs md:text-base">{{ selectedParticipant.token }}</div>
              </div>
              <div>
                <div class="text-xs md:text-sm text-gray-600 mb-1">Jenis Tes</div>
                <div class="font-medium text-gray-900 text-sm md:text-base">{{ selectedParticipant.jenisTest }}</div>
              </div>
              <div>
                <div class="text-xs md:text-sm text-gray-600 mb-1">Tanggal Tes</div>
                <div class="font-medium text-gray-900 text-sm md:text-base">{{ selectedParticipant.tanggalTest }}</div>
              </div>
            </div>
          </div>

          <!-- Upload Area -->
          <div v-if="selectedParticipant" class="mb-4 md:mb-6">
            <label class="block text-gray-700 font-medium mb-2 md:mb-3 text-sm md:text-base">Upload File PDF</label>
            
            <label v-if="!uploadedFile" class="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#2563FF] hover:bg-blue-50/50 transition-all min-h-[180px]">
              <input
                type="file"
                accept=".pdf"
                @change="handleFileSelect"
                class="hidden"
              />
              <UploadIcon class="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3 md:mb-4" />
              <div class="text-center">
                <div class="text-gray-700 font-medium mb-1 text-sm md:text-base">Drop file atau klik untuk memilih</div>
                <div class="text-xs md:text-sm text-gray-500">Format: PDF (Max 10MB)</div>
              </div>
            </label>

            <div v-else class="border-2 border-gray-300 rounded-xl p-4 md:p-6 flex items-center justify-between bg-gray-50">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText class="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-gray-900 text-sm md:text-base truncate">{{ uploadedFile.name }}</div>
                  <div class="text-xs md:text-sm text-gray-500">
                    {{ (uploadedFile.size / 1024).toFixed(2) }} KB
                  </div>
                </div>
              </div>
              <button
                @click="uploadedFile = null"
                class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-lg transition-all flex-shrink-0 ml-2"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="selectedParticipant" class="flex flex-col sm:flex-row gap-3">
            <Button
              @click="handleUpload"
              :disabled="!uploadedFile || uploadStatus === 'uploading'"
              class="flex-1 bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-0 text-sm md:text-base"
            >
              <LoadingSpinner v-if="uploadStatus === 'uploading'" class="w-4 h-4" />
              <UploadIcon v-else class="w-4 h-4 md:mr-2" />
              <span class="ml-2">{{ uploadStatus === 'uploading' ? `Uploading... ${uploadProgress}%` : 'Upload & Simpan' }}</span>
            </Button>
            <Button
              @click="handleCancel"
              :disabled="uploadStatus === 'uploading'"
              variant="outline"
              class="flex-1 h-11 md:h-12 border-2 border-gray-300 hover:bg-gray-50 min-h-[44px] md:min-h-0 text-sm md:text-base disabled:opacity-50"
            >
              Batal
            </Button>
          </div>
          
          <!-- Upload Progress Bar -->
          <div v-if="uploadStatus === 'uploading'" class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] h-2.5 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-2 text-center">Sedang mengupload file...</p>
          </div>

          <!-- Status Messages -->
          <div class="mt-4 md:mt-6">
            <div v-if="uploadStatus === 'idle' && !selectedParticipant" class="flex items-center gap-2 text-gray-600 bg-gray-100 p-3 md:p-4 rounded-xl">
              <div class="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
              <span class="text-xs md:text-sm">Belum ada file dipilih</span>
            </div>

            <div v-if="uploadStatus === 'success'" class="flex items-center gap-2 text-green-700 bg-green-50 p-3 md:p-4 rounded-xl border-2 border-green-200">
              <CheckCircle class="w-5 h-5 flex-shrink-0" />
              <span class="text-xs md:text-sm font-medium">File berhasil diunggah dan tersimpan!</span>
            </div>

            <div v-if="uploadStatus === 'error'" class="flex items-center gap-2 text-red-700 bg-red-50 p-3 md:p-4 rounded-xl border-2 border-red-200">
              <XCircle class="w-5 h-5 flex-shrink-0" />
              <span class="text-xs md:text-sm">{{ errorMessage || 'Gagal upload. Pastikan file sudah dipilih.' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

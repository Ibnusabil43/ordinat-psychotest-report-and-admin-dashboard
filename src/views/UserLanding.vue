<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Check, ChevronDown, Download, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import { getParticipantByToken } from '@/services/participantService';
import { getInstitutionByToken } from '@/services/institutionService';
import { getResultsByParticipant, getResultsByInstitution, downloadResult } from '@/services/resultsService';
import { logDownload } from '@/services/activityService';
import type { Participant, Institution, PsychotestResult, EntityType } from '@/types/models';

const router = useRouter();

const userType = ref<EntityType>('cpmi');
const formData = ref({
  nama: '',
  token: '',
  tanggalLahir: '',
  namaInstansi: ''
});
const formStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const errorMessage = ref<string | null>(null);
const showFiles = ref(false);
const verifiedEntity = ref<Participant | Institution | null>(null);
const availableResults = ref<PsychotestResult[]>([]);
const downloadingIds = ref<Set<string>>(new Set());

// Verify token and load data
const handleCheckData = async () => {
  const token = formData.value.token.trim();
  const name = userType.value === 'cpmi' 
    ? formData.value.nama.trim() 
    : formData.value.namaInstansi.trim();
  
  if (!token || !name) {
    formStatus.value = 'error';
    errorMessage.value = 'Mohon lengkapi semua field yang diperlukan';
    return;
  }
  
  formStatus.value = 'loading';
  errorMessage.value = null;
  verifiedEntity.value = null;
  availableResults.value = [];
  showFiles.value = false;
  
  try {
    if (userType.value === 'cpmi') {
      // Verify CPMI by token
      const participant = await getParticipantByToken(token);
      
      if (!participant) {
        throw new Error('Token tidak ditemukan');
      }
      
      // Verify name matches (case-insensitive)
      if (participant.namaLengkap.toLowerCase() !== name.toLowerCase()) {
        throw new Error('Nama tidak cocok dengan token');
      }
      
      // Get results for this participant
      const results = await getResultsByParticipant(participant.id!);
      
      if (results.length === 0) {
        throw new Error('Belum ada hasil psikotes untuk token ini');
      }
      
      verifiedEntity.value = participant;
      availableResults.value = results;
      formStatus.value = 'success';
      
    } else {
      // Verify Institution by token
      const institution = await getInstitutionByToken(token);
      
      if (!institution) {
        throw new Error('Token instansi tidak ditemukan');
      }
      
      // Verify name matches (case-insensitive, partial match)
      if (!institution.namaInstansi.toLowerCase().includes(name.toLowerCase())) {
        throw new Error('Nama instansi tidak cocok dengan token');
      }
      
      // Get results for this institution
      const results = await getResultsByInstitution(institution.id!);
      
      verifiedEntity.value = institution;
      availableResults.value = results;
      formStatus.value = 'success';
      showFiles.value = true;
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    formStatus.value = 'error';
    errorMessage.value = error.message || 'Token tidak valid atau data tidak ditemukan';
  }
};

// Download a result file
const handleDownload = async (result: PsychotestResult) => {
  if (!result.id || downloadingIds.value.has(result.id)) return;
  
  downloadingIds.value.add(result.id);
  
  try {
    // Get download URL and trigger download
    const url = await downloadResult(result.id);
    
    // Create a temporary link and click it to download
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log the download activity
    await logDownload(
      result.entityName || result.entityId,
      result.entityType,
      result.token,
      'anonymous', // Guest download
      result.id,
      result.fileName
    );
  } catch (error: any) {
    console.error('Download error:', error);
    alert('Gagal mengunduh file. Silakan coba lagi.');
  } finally {
    downloadingIds.value.delete(result.id!);
  }
};

const handleTypeChange = (value: string) => {
  userType.value = value as EntityType;
  formStatus.value = 'idle';
  errorMessage.value = null;
  showFiles.value = false;
  verifiedEntity.value = null;
  availableResults.value = [];
  formData.value = { nama: '', token: '', tanggalLahir: '', namaInstansi: '' };
};

const scrollToDownload = () => {
  document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth' });
};

// Format date for display
const formatDate = (date: any): string => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative min-h-screen bg-gradient-to-br from-[#2563FF] via-[#4F46E5] to-[#7C3AED] overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div class="container mx-auto px-6 md:px-12 py-20 relative z-10">
        <div class="max-w-7xl mx-auto">
          <nav class="flex items-center justify-between mb-20">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <span class="text-white font-bold text-lg">OC</span>
              </div>
              <span class="text-white font-semibold text-lg">Ordinat Cakrawala</span>
            </div>
            <button @click="router.push('/')" class="px-6 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
              <ArrowLeft class="w-4 h-4" />
              Kembali
            </button>
          </nav>

          <div class="grid lg:grid-cols-5 gap-16 items-center">
            <div class="lg:col-span-3 space-y-8 text-white">
              <div class="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm">
                ✓ Sistem Aman & Terenkripsi
              </div>
              
              <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1]">
                Portal Hasil<br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Psikotes Digital</span>
              </h1>
              
              <p class="text-xl text-white/90 max-w-2xl leading-relaxed">
                Akses hasil psikotes untuk CPMI, sekolah, dan organisasi. Proses cepat, terstruktur, dan aman dengan sistem token unik.
              </p>

              <div class="flex flex-wrap gap-4">
                <Button size="lg" class="bg-white text-[#2563FF] hover:bg-white/90 px-8 h-14 text-base font-semibold shadow-xl" @click="scrollToDownload">
                  <Download class="w-5 h-5 mr-2" />
                  Unduh Hasil Sekarang
                </Button>
                <Button size="lg" variant="outline" class="border-2 border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 px-8 h-14 text-base font-semibold">
                  Tentang Kami
                </Button>
              </div>

              <div class="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div class="text-4xl font-bold mb-1">1997</div>
                  <div class="text-white/70 text-sm">Tahun Berdiri</div>
                </div>
                <div>
                  <div class="text-4xl font-bold mb-1">95+</div>
                  <div class="text-white/70 text-sm">Klien Aktif</div>
                </div>
                <div>
                  <div class="text-4xl font-bold mb-1">100%</div>
                  <div class="text-white/70 text-sm">Keamanan Data</div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2 space-y-4">
              <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Check class="w-6 h-6 text-white" :stroke-width="3" />
                </div>
                <h3 class="text-white font-semibold text-lg mb-2">Akses CPMI</h3>
                <p class="text-white/80 text-sm">Download hasil psikotes untuk Calon Pekerja Migran Indonesia</p>
              </div>

              <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Check class="w-6 h-6 text-white" :stroke-width="3" />
                </div>
                <h3 class="text-white font-semibold text-lg mb-2">Portal Instansi</h3>
                <p class="text-white/80 text-sm">Unduh laporan psikotes untuk lembaga dan sekolah</p>
              </div>

              <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Check class="w-6 h-6 text-white" :stroke-width="3" />
                </div>
                <h3 class="text-white font-semibold text-lg mb-2">Token Unik</h3>
                <p class="text-white/80 text-sm">Sistem terproteksi dengan autentikasi token</p>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown class="w-8 h-8 text-white/50" />
        </div>
      </div>
    </section>

    <!-- Download Section -->
    <section id="download-section" class="py-24 bg-white">
      <div class="container mx-auto px-6 md:px-12">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-16">
            <div class="inline-block px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              Download Portal
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Unduh Hasil Psikotes Anda</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">Pilih kategori pengguna dan masukkan informasi yang diperlukan</p>
          </div>

          <div class="bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
            <div class="mb-8">
              <label class="block text-gray-900 font-semibold mb-4">Kategori Pengguna</label>
              <Select v-model="userType" @update:model-value="handleTypeChange" class="w-full bg-white border-2 border-gray-300 h-14 px-5 text-base rounded-md hover:border-[#2563FF] transition-colors">
                <option value="cpmi">🧑‍💼 CPMI (Calon Pekerja Migran Indonesia)</option>
                <option value="instansi">🏢 Instansi / Lembaga / Sekolah</option>
              </Select>
            </div>

            <div v-if="userType === 'cpmi'" class="space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-3">Nama Lengkap</label>
                <Input 
                  v-model="formData.nama" 
                  :disabled="formStatus === 'loading'"
                  placeholder="Masukkan nama lengkap sesuai KTP" 
                  class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF] disabled:opacity-50" 
                />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-3">Token Akses</label>
                <Input 
                  v-model="formData.token" 
                  :disabled="formStatus === 'loading'"
                  placeholder="Masukkan kode token unik Anda" 
                  class="bg-white border-2 border-gray-300 h-14 px-5 font-mono focus:border-[#2563FF] disabled:opacity-50" 
                />
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-3">Tanggal Lahir <span class="text-gray-400">(Opsional)</span></label>
                <Input 
                  v-model="formData.tanggalLahir" 
                  :disabled="formStatus === 'loading'"
                  type="date" 
                  class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF] disabled:opacity-50" 
                />
              </div>

              <Button 
                :disabled="formStatus === 'loading'"
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 text-base font-semibold shadow-lg disabled:opacity-50" 
                @click="handleCheckData"
              >
                <Loader2 v-if="formStatus === 'loading'" class="w-5 h-5 mr-2 animate-spin" />
                {{ formStatus === 'loading' ? 'Memverifikasi...' : 'Verifikasi & Cek Data' }}
              </Button>

              <div v-if="formStatus === 'success' && availableResults.length > 0" class="mt-6 space-y-4 p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div class="flex items-center gap-3 text-green-700">
                  <CheckCircle class="w-6 h-6" />
                  <span class="font-semibold">Data berhasil ditemukan!</span>
                </div>
                <div v-for="result in availableResults" :key="result.id" class="bg-white rounded-lg p-4 border border-green-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-gray-900">{{ result.jenisTest }}</div>
                      <div class="text-sm text-gray-500">Tanggal: {{ formatDate(result.tanggalTest) }}</div>
                    </div>
                    <Button 
                      @click="handleDownload(result)"
                      :disabled="downloadingIds.has(result.id!)"
                      class="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      <Loader2 v-if="downloadingIds.has(result.id!)" class="w-4 h-4 mr-1 animate-spin" />
                      <Download v-else class="w-4 h-4 mr-1" />
                      {{ downloadingIds.has(result.id!) ? 'Mengunduh...' : 'Download PDF' }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-3">Nama Instansi / Lembaga</label>
                <Input 
                  v-model="formData.namaInstansi" 
                  :disabled="formStatus === 'loading'"
                  placeholder="Contoh: SMK Negeri 1 Jakarta" 
                  class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF] disabled:opacity-50" 
                />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-3">Token Akses Instansi</label>
                <Input 
                  v-model="formData.token" 
                  :disabled="formStatus === 'loading'"
                  placeholder="Masukkan kode token yang diberikan" 
                  class="bg-white border-2 border-gray-300 h-14 px-5 font-mono focus:border-[#2563FF] disabled:opacity-50" 
                />
              </div>

              <Button 
                :disabled="formStatus === 'loading'"
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 text-base font-semibold shadow-lg disabled:opacity-50" 
                @click="handleCheckData"
              >
                <Loader2 v-if="formStatus === 'loading'" class="w-5 h-5 mr-2 animate-spin" />
                {{ formStatus === 'loading' ? 'Mencari...' : 'Cari File Tersedia' }}
              </Button>

              <div v-if="showFiles && availableResults.length > 0" class="mt-6 bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
                <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-6 py-4">
                  <h3 class="font-semibold text-white">File Tersedia untuk Diunduh ({{ availableResults.length }} file)</h3>
                </div>
                <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  <div 
                    v-for="result in availableResults" 
                    :key="result.id" 
                    class="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <div class="font-medium text-gray-900">{{ result.entityName }}</div>
                      <div class="text-sm text-gray-500">Tanggal tes: {{ formatDate(result.tanggalTest) }}</div>
                    </div>
                    <Button 
                      size="sm" 
                      @click="handleDownload(result)"
                      :disabled="downloadingIds.has(result.id!)"
                      class="bg-[#2563FF] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
                    >
                      <Loader2 v-if="downloadingIds.has(result.id!)" class="w-4 h-4 mr-1 animate-spin" />
                      <Download v-else class="w-4 h-4 mr-1" />
                      {{ downloadingIds.has(result.id!) ? '...' : 'Download' }}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div v-if="showFiles && availableResults.length === 0" class="mt-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl text-center">
                <p class="text-gray-600">Belum ada file hasil psikotes untuk instansi ini.</p>
              </div>
            </div>

            <div v-if="formStatus === 'error'" class="mt-6 flex items-start gap-3 text-red-700 bg-red-50 p-5 border-2 border-red-200 rounded-xl">
              <XCircle class="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold mb-1">Verifikasi Gagal</div>
                <div class="text-sm">{{ errorMessage || 'Silakan periksa kembali data yang Anda masukkan.' }}</div>
              </div>
            </div>

            <div v-if="formStatus === 'success' && userType === 'instansi' && availableResults.length > 0" class="mt-6 flex items-start gap-3 text-green-700 bg-green-50 p-5 border-2 border-green-200 rounded-xl">
              <CheckCircle class="w-6 h-6 mt-0.5 flex-shrink-0" />
              <span>Berhasil! Silakan pilih file yang ingin diunduh dari daftar di atas.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gradient-to-br from-gray-50 to-purple-50 border-t">
      <div class="container mx-auto px-6 md:px-12">
        <div class="max-w-5xl mx-auto text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Butuh Bantuan?</h3>
          <p class="text-gray-600 mb-8">Hubungi tim dukungan kami atau akses panel administrator</p>
          <div class="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" class="border-2 border-gray-300">📞 Hubungi Support</Button>
            <Button variant="outline" class="border-2 border-gray-300">📧 Email Kami</Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

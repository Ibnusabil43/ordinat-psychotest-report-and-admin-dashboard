<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Check, ChevronDown, Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';

const router = useRouter();

const userType = ref<'cpmi' | 'instansi'>('cpmi');
const formData = ref({
  nama: '',
  token: '',
  tanggalLahir: '',
  namaInstansi: ''
});
const formStatus = ref<'idle' | 'success' | 'error'>('idle');
const showFiles = ref(false);

const handleCheckData = () => {
  if (formData.value.token && (userType.value === 'cpmi' ? formData.value.nama : formData.value.namaInstansi)) {
    formStatus.value = 'success';
    if (userType.value === 'instansi') {
      showFiles.value = true;
    }
  } else {
    formStatus.value = 'error';
  }
};

const handleTypeChange = (value: string) => {
  userType.value = value as 'cpmi' | 'instansi';
  formStatus.value = 'idle';
  showFiles.value = false;
  formData.value = { nama: '', token: '', tanggalLahir: '', namaInstansi: '' };
};

const scrollToDownload = () => {
  document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth' });
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
                <Input v-model="formData.nama" placeholder="Masukkan nama lengkap sesuai KTP" class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF]" />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-3">Token Akses</label>
                <Input v-model="formData.token" placeholder="Masukkan kode token unik Anda" class="bg-white border-2 border-gray-300 h-14 px-5 font-mono focus:border-[#2563FF]" />
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-3">Tanggal Lahir <span class="text-gray-400">(Opsional)</span></label>
                <Input v-model="formData.tanggalLahir" type="date" class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF]" />
              </div>

              <Button class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 text-base font-semibold shadow-lg" @click="handleCheckData">
                Verifikasi & Cek Data
              </Button>

              <div v-if="formStatus === 'success'" class="mt-6 space-y-4 p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div class="flex items-center gap-3 text-green-700">
                  <CheckCircle class="w-6 h-6" />
                  <span class="font-semibold">Data berhasil ditemukan!</span>
                </div>
                <Button class="w-full bg-green-600 hover:bg-green-700 text-white h-14 font-semibold">
                  <Download class="w-5 h-5 mr-2" />
                  Download Hasil Psikotes (PDF)
                </Button>
              </div>
            </div>

            <div v-else class="space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-3">Nama Instansi / Lembaga</label>
                <Input v-model="formData.namaInstansi" placeholder="Contoh: SMK Negeri 1 Jakarta" class="bg-white border-2 border-gray-300 h-14 px-5 focus:border-[#2563FF]" />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-3">Token Akses Instansi</label>
                <Input v-model="formData.token" placeholder="Masukkan kode token yang diberikan" class="bg-white border-2 border-gray-300 h-14 px-5 font-mono focus:border-[#2563FF]" />
              </div>

              <Button class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 text-base font-semibold shadow-lg" @click="handleCheckData">
                Cari File Tersedia
              </Button>

              <div v-if="showFiles" class="mt-6 bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
                <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-6 py-4">
                  <h3 class="font-semibold text-white">File Tersedia untuk Diunduh</h3>
                </div>
                <div class="divide-y divide-gray-200">
                  <div v-for="(file, idx) in [
                    { nama: 'Ahmad Fauzi', tanggal: '15 Des 2025' },
                    { nama: 'Siti Nurhaliza', tanggal: '14 Des 2025' },
                    { nama: 'Budi Santoso', tanggal: '13 Des 2025' }
                  ]" :key="idx" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <div class="font-medium text-gray-900">{{ file.nama }}</div>
                      <div class="text-sm text-gray-500">Tanggal tes: {{ file.tanggal }}</div>
                    </div>
                    <Button size="sm" class="bg-[#2563FF] hover:bg-[#1d4ed8] text-white">
                      <Download class="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="formStatus === 'error'" class="mt-6 flex items-start gap-3 text-red-700 bg-red-50 p-5 border-2 border-red-200 rounded-xl">
              <XCircle class="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <div class="font-semibold mb-1">Token Tidak Valid</div>
                <div class="text-sm">Silakan periksa kembali kode token yang Anda masukkan.</div>
              </div>
            </div>

            <div v-if="formStatus === 'success' && userType === 'instansi'" class="mt-6 flex items-start gap-3 text-green-700 bg-green-50 p-5 border-2 border-green-200 rounded-xl">
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

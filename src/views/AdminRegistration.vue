<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import { RefreshCw } from 'lucide-vue-next';

const authStore = useAuthStore();

const registrationType = ref<'cpmi' | 'instansi'>('cpmi');
const formData = ref({
  namaLengkap: '',
  tempatTanggalLahir: '',
  pendidikan: '',
  nik: '',
  namaInstansi: '',
  token: 'CPM-2026-' + Math.random().toString(36).substr(2, 6).toUpperCase()
});

const generateToken = () => {
  const prefix = registrationType.value === 'cpmi' ? 'CPM' : 'INS';
  formData.value.token = `${prefix}-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const handleSubmit = () => {
  alert(`Data ${registrationType.value === 'cpmi' ? 'peserta' : 'instansi'} berhasil disimpan!`);
};

const handleTypeChange = (value: string) => {
  registrationType.value = value as 'cpmi' | 'instansi';
  generateToken();
  formData.value = {
    namaLengkap: '',
    tempatTanggalLahir: '',
    pendidikan: '',
    nik: '',
    namaInstansi: '',
    token: formData.value.token
  };
};

const recentRegistrations = [
  { nama: 'Ahmad Fauzi', tipe: 'CPMI', token: 'CPM-2026-A1B2C3', tanggal: '07 Jan 2026' },
  { nama: 'SMK Negeri 1 Jakarta', tipe: 'Instansi', token: 'INS-2026-D4E5F6', tanggal: '07 Jan 2026' },
  { nama: 'Siti Nurhaliza', tipe: 'CPMI', token: 'CPM-2026-G7H8I9', tanggal: '06 Jan 2026' },
  { nama: 'PT Maju Jaya', tipe: 'Instansi', token: 'INS-2026-J1K2L3', tanggal: '06 Jan 2026' },
  { nama: 'Budi Santoso', tipe: 'CPMI', token: 'CPM-2026-M4N5O6', tanggal: '05 Jan 2026' },
];
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
        <!-- Registration Form Card -->
        <div class="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-8 mb-6 md:mb-8">
          <form @submit.prevent="handleSubmit">
            <!-- Type Selector -->
            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-3 text-sm md:text-base">Tipe Pendaftaran</label>
              <Select
                v-model="registrationType"
                @update:model-value="handleTypeChange"
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
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">Tempat tanggal lahir</label>
                  <Input
                    v-model="formData.tempatTanggalLahir"
                    placeholder="Jakarta, 15 Januari 1990"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
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
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-gray-700 font-medium mb-2 text-sm">NIK / Nomor Paspor</label>
                  <Input
                    v-model="formData.nik"
                    placeholder="Masukkan NIK atau nomor paspor"
                    class="bg-gray-50 border-2 border-gray-300 h-11 md:h-12 px-4 focus:border-[#2563FF] text-sm md:text-base"
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
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 font-semibold text-sm md:text-base min-h-[44px] md:min-h-0"
              >
                Simpan Data Peserta
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
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 min-h-[44px] md:min-h-0 text-sm md:text-base"
                  >
                    <RefreshCw class="w-4 h-4 md:mr-2" />
                    <span class="hidden md:inline">Generate</span>
                  </Button>
                </div>
              </div>

              <Button 
                type="submit"
                class="w-full bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-11 md:h-12 font-semibold text-sm md:text-base min-h-[44px] md:min-h-0"
              >
                Simpan Data Instansi
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

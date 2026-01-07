<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import { Users, FileText, Download } from 'lucide-vue-next';

const authStore = useAuthStore();

const stats = [
  { label: 'Total Peserta Terdaftar', value: '1,247', icon: Users, color: 'from-blue-500 to-blue-600' },
  { label: 'Total File Terupload', value: '892', icon: FileText, color: 'from-purple-500 to-purple-600' },
  { label: 'Total Unduhan', value: '3,456', icon: Download, color: 'from-green-500 to-green-600' },
];

const activities = [
  { tanggal: '07 Jan 2026', nama: 'Ahmad Fauzi', tipe: 'CPMI', token: 'CPM-2026-001', status: 'Upload Berhasil' },
  { tanggal: '07 Jan 2026', nama: 'SMK Negeri 1 Jakarta', tipe: 'Instansi', token: 'INS-2026-042', status: 'Registrasi' },
  { tanggal: '06 Jan 2026', nama: 'Siti Nurhaliza', tipe: 'CPMI', token: 'CPM-2026-002', status: 'Upload Berhasil' },
  { tanggal: '06 Jan 2026', nama: 'PT Maju Jaya', tipe: 'Instansi', token: 'INS-2026-043', status: 'Unduhan' },
  { tanggal: '05 Jan 2026', nama: 'Budi Santoso', tipe: 'CPMI', token: 'CPM-2026-003', status: 'Registrasi' },
];
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AdminSidebar />
    
    <div class="md:ml-64 flex-1">
      <!-- Top Bar -->
      <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10">
        <div class="ml-12 md:ml-0">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-1">Selamat datang di panel admin</p>
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
      <div class="p-4 md:p-8">
        <!-- Statistics Cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div
            v-for="(stat, idx) in stats"
            :key="idx"
            class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#2563FF] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div class="flex items-start justify-between mb-4">
              <div :class="['w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center transition-transform duration-300 hover:scale-110', stat.color]">
                <component :is="stat.icon" class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300">{{ stat.value }}</div>
            <div class="text-sm text-gray-600">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Activity Table -->
        <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4">
            <h2 class="text-base md:text-lg font-bold text-white">Aktivitas Terbaru</h2>
          </div>
          
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama / Instansi</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipe</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Token</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(activity, idx) in activities"
                  :key="idx"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 text-sm text-gray-600">{{ activity.tanggal }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ activity.nama }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex px-3 py-1 rounded-md text-xs font-medium',
                      activity.tipe === 'CPMI' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    ]">
                      {{ activity.tipe }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ activity.token }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex px-3 py-1 rounded-md text-xs font-medium',
                      activity.status === 'Upload Berhasil'
                        ? 'bg-green-100 text-green-700'
                        : activity.status === 'Registrasi'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    ]">
                      {{ activity.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="md:hidden divide-y divide-gray-200">
            <div
              v-for="(activity, idx) in activities"
              :key="idx"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="font-medium text-gray-900 text-sm">{{ activity.nama }}</div>
                <span :class="[
                  'inline-flex px-2 py-0.5 rounded-md text-xs font-medium',
                  activity.tipe === 'CPMI' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                ]">
                  {{ activity.tipe }}
                </span>
              </div>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-500">Tanggal:</span>
                  <span class="text-gray-900 font-medium">{{ activity.tanggal }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Token:</span>
                  <span class="text-gray-900 font-mono">{{ activity.token }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Status:</span>
                  <span :class="[
                    'inline-flex px-2 py-0.5 rounded-md text-xs font-medium',
                    activity.status === 'Upload Berhasil'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'Registrasi'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  ]">
                    {{ activity.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

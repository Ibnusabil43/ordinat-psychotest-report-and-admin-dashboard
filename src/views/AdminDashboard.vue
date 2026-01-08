<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminSidebar from '@/components/AdminSidebar.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { Users, FileText, Download } from 'lucide-vue-next';
import { getDashboardStatsDisplay } from '@/services/statsService';
import { getRecentActivityLogs, getStatusLabel, getTypeLabel } from '@/services/activityService';
import type { ActivityLog } from '@/types/models';
import { Timestamp } from 'firebase/firestore';

const authStore = useAuthStore();

// Loading states
const isLoadingStats = ref(true);
const isLoadingActivities = ref(true);
const statsError = ref<string | null>(null);
const activitiesError = ref<string | null>(null);

// Data
const stats = ref([
  { label: 'Total Peserta Terdaftar', value: '0', icon: Users, color: 'from-blue-500 to-blue-600' },
  { label: 'Total File Terupload', value: '0', icon: FileText, color: 'from-purple-500 to-purple-600' },
  { label: 'Total Unduhan', value: '0', icon: Download, color: 'from-green-500 to-green-600' },
]);

const activities = ref<Array<{
  tanggal: string;
  nama: string;
  tipe: string;
  token: string;
  status: string;
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

// Load dashboard statistics
async function loadStats() {
  isLoadingStats.value = true;
  statsError.value = null;
  
  try {
    const statsData = await getDashboardStatsDisplay();
    stats.value = [
      { label: 'Total Peserta Terdaftar', value: statsData.totalPeserta, icon: Users, color: 'from-blue-500 to-blue-600' },
      { label: 'Total File Terupload', value: statsData.totalFiles, icon: FileText, color: 'from-purple-500 to-purple-600' },
      { label: 'Total Unduhan', value: statsData.totalDownloads, icon: Download, color: 'from-green-500 to-green-600' },
    ];
  } catch (error) {
    console.error('Error loading stats:', error);
    statsError.value = 'Gagal memuat statistik';
  } finally {
    isLoadingStats.value = false;
  }
}

// Load recent activities
async function loadActivities() {
  isLoadingActivities.value = true;
  activitiesError.value = null;
  
  try {
    const logs = await getRecentActivityLogs(5);
    activities.value = logs.map((log: ActivityLog) => ({
      tanggal: formatDate(log.tanggal),
      nama: log.nama,
      tipe: getTypeLabel(log.tipe),
      token: log.token,
      status: getStatusLabel(log.status),
    }));
  } catch (error) {
    console.error('Error loading activities:', error);
    activitiesError.value = 'Gagal memuat aktivitas';
  } finally {
    isLoadingActivities.value = false;
  }
}

onMounted(() => {
  loadStats();
  loadActivities();
});
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
          <!-- Loading State for Stats -->
          <template v-if="isLoadingStats">
            <div v-for="i in 3" :key="i" class="bg-white border-2 border-gray-200 rounded-xl p-6 animate-pulse">
              <div class="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div class="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </template>
          
          <!-- Stats Cards -->
          <template v-else>
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
          </template>
        </div>

        <!-- Activity Table -->
        <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] px-4 md:px-6 py-3 md:py-4">
            <h2 class="text-base md:text-lg font-bold text-white">Aktivitas Terbaru</h2>
          </div>
          
          <!-- Loading State for Activities -->
          <div v-if="isLoadingActivities" class="p-8 flex items-center justify-center">
            <LoadingSpinner class="w-8 h-8 text-[#2563FF]" />
            <span class="ml-3 text-gray-600">Memuat aktivitas...</span>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="activities.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FileText class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-600">Belum ada aktivitas</p>
          </div>
          
          <!-- Desktop Table View -->
          <div v-else class="hidden md:block overflow-x-auto">
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

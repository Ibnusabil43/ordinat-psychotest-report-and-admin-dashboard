<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { Search, LogOut, Clock, Users, AlertCircle } from 'lucide-vue-next';
import { searchParticipants, getParticipantByToken } from '@/services/participantService';
import { searchInstitutions } from '@/services/institutionService';
import type { Participant, Institution } from '@/types/models';

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const searchResults = ref<Array<{
  id: string;
  timestamp: string;
  name: string;
  info: string;
  type: 'cpmi' | 'instansi';
  status: 'found' | 'not-found';
}>>([]);
const hasSearched = ref(false);
const isSearching = ref(false);
const errorMessage = ref<string | null>(null);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  hasSearched.value = true;
  isSearching.value = true;
  searchResults.value = [];
  errorMessage.value = null;
  
  try {
    const query = searchQuery.value.trim();
    const results: typeof searchResults.value = [];
    const now = new Date().toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // First, try searching by token directly
    const byToken = await getParticipantByToken(query);
    if (byToken) {
      results.push({
        id: byToken.id || '',
        timestamp: now,
        name: byToken.namaLengkap,
        info: byToken.nikOrPaspor || 'No NIK/Passport',
        type: 'cpmi',
        status: 'found',
      });
    }
    
    // Search participants by name/NIK
    const participants = await searchParticipants(query, 10);
    participants.forEach((p: Participant) => {
      // Avoid duplicates if already found by token
      if (!results.find(r => r.id === p.id)) {
        results.push({
          id: p.id || '',
          timestamp: now,
          name: p.namaLengkap,
          info: p.nikOrPaspor || 'No NIK/Passport',
          type: 'cpmi',
          status: 'found',
        });
      }
    });
    
    // Also search institutions
    const institutions = await searchInstitutions(query, 5);
    institutions.forEach((i: Institution) => {
      results.push({
        id: i.id || '',
        timestamp: now,
        name: i.namaInstansi,
        info: `${i.participantCount || 0} peserta`,
        type: 'instansi',
        status: 'found',
      });
    });
    
    if (results.length === 0) {
      // No results found
      results.push({
        id: '0',
        timestamp: now,
        name: query,
        info: '-',
        type: 'cpmi',
        status: 'not-found',
      });
    }
    
    searchResults.value = results;
  } catch (error: any) {
    console.error('Search error:', error);
    errorMessage.value = error.message || 'Terjadi kesalahan saat mencari data';
  } finally {
    isSearching.value = false;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/admin/login');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#2563FF] via-[#4F46E5] to-[#7C3AED] relative overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Header Bar -->
    <div class="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
            <span class="text-white font-bold">OC</span>
          </div>
          <div>
            <div class="text-white font-semibold">Tester Portal</div>
            <div class="text-white/70 text-xs">Ordinat Cakrawala</div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
        >
          <LogOut class="w-4 h-4" />
          <span class="text-sm">Keluar</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Tester Portal – Participant Data Verification
        </h1>
        <p class="text-xl text-white/90 max-w-2xl mx-auto">
          Verify participant data during school psychotest sessions. Read-only access.
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <!-- Search Section -->
        <div class="mb-8">
          <label class="block text-gray-900 font-semibold mb-4 text-lg">
            Search by Participant Name or Token
          </label>
          <form @submit.prevent="handleSearch" class="flex gap-3">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Type participant name, NIK, or token"
              :disabled="isSearching"
              class="bg-gray-50 border-2 border-gray-300 h-14 px-5 text-base focus:border-[#2563FF] flex-1 disabled:opacity-50"
            />
            <Button 
              type="submit"
              :disabled="isSearching || !searchQuery.trim()"
              class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 px-8 font-semibold shadow-lg disabled:opacity-50"
            >
              <LoadingSpinner v-if="isSearching" class="w-5 h-5 mr-2" />
              <Search v-else class="w-5 h-5 mr-2" />
              {{ isSearching ? 'Searching...' : 'Search' }}
            </Button>
          </form>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span class="text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="hasSearched" class="mt-8">
          <div v-if="searchResults.length > 0">
            <!-- Desktop Table View -->
            <div class="hidden md:block border-2 border-gray-200 rounded-xl overflow-hidden">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] text-white sticky top-0">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold">
                      <div class="flex items-center gap-2">
                        <Clock class="w-4 h-4" />
                        Timestamp
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold">
                      <div class="flex items-center gap-2">
                        <Users class="w-4 h-4" />
                        Participant Name
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold">Type / Info</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr 
                    v-for="result in searchResults"
                    :key="result.id" 
                    :class="[
                      'transition-colors',
                      result.status === 'found' 
                        ? 'hover:bg-green-50 bg-white even:bg-gray-50' 
                        : 'hover:bg-red-50 bg-white even:bg-gray-50'
                    ]"
                  >
                    <td class="px-6 py-4 text-sm text-gray-600">{{ result.timestamp }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ result.name }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2" 
                            :class="result.type === 'cpmi' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                        {{ result.type === 'cpmi' ? 'CPMI' : 'Instansi' }}
                      </span>
                      {{ result.info }}
                    </td>
                    <td class="px-6 py-4">
                      <span v-if="result.status === 'found'" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        ✓ Found / Registered
                      </span>
                      <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        ✗ Not Found
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden space-y-4">
              <div 
                v-for="result in searchResults"
                :key="result.id" 
                :class="[
                  'p-5 rounded-xl border-2',
                  result.status === 'found' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                ]"
              >
                <div class="space-y-3">
                  <div>
                    <div class="text-xs text-gray-600 mb-1">Participant Name</div>
                    <div class="font-semibold text-gray-900">{{ result.name }}</div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <div class="text-xs text-gray-600 mb-1">Type / Info</div>
                      <div class="text-sm text-gray-900">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" 
                              :class="result.type === 'cpmi' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                          {{ result.type === 'cpmi' ? 'CPMI' : 'Instansi' }}
                        </span>
                        <span class="ml-1">{{ result.info }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-600 mb-1">Status</div>
                      <span v-if="result.status === 'found'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ Found
                      </span>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        ✗ Not Found
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-600 mb-1">Timestamp</div>
                    <div class="text-xs text-gray-900">{{ result.timestamp }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16">
            <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Search class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No data found for this name.</h3>
            <p class="text-gray-600">Try searching with a different participant name.</p>
          </div>
        </div>

        <!-- Initial State -->
        <div v-if="!hasSearched" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <div class="w-20 h-20 bg-gradient-to-br from-[#2563FF] to-[#7C3AED] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Ready to search</h3>
          <p class="text-gray-600">Enter a participant name above and click Search.</p>
        </div>

        <!-- Info Box -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start gap-3">
            <div class="text-blue-600 text-xl">ℹ️</div>
            <div class="text-sm text-blue-900">
              <strong>Tester Role - Read Only:</strong> You can only search and view participant data. 
              You cannot edit, upload, or register new participants.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

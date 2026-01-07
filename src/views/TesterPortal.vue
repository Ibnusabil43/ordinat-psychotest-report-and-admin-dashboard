<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { Search, LogOut, Clock, Users } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const hasSearched = ref(false);

const mockParticipants = [
  { id: 1, timestamp: '07 Jan 2026, 09:15', name: 'Ahmad Fauzi', class: 'XII IPA 1', status: 'found' },
  { id: 2, timestamp: '07 Jan 2026, 09:20', name: 'Siti Nurhaliza', class: 'XII IPA 2', status: 'found' },
  { id: 3, timestamp: '07 Jan 2026, 09:25', name: 'Budi Santoso', class: 'XII IPS 1', status: 'found' },
  { id: 4, timestamp: '07 Jan 2026, 09:30', name: 'Dewi Lestari', class: 'XII IPS 2', status: 'found' },
  { id: 5, timestamp: '07 Jan 2026, 09:35', name: 'Rudi Hermawan', class: 'XII IPA 3', status: 'found' },
];

const handleSearch = () => {
  hasSearched.value = true;

  if (searchQuery.value.trim()) {
    const results = mockParticipants.filter(p => 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    
    if (results.length === 0) {
      searchResults.value = [{
        id: 0,
        timestamp: new Date().toLocaleString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        name: searchQuery.value,
        class: '-',
        status: 'not-found'
      }];
    } else {
      searchResults.value = results;
    }
  } else {
    searchResults.value = [];
  }
};

const handleLogout = () => {
  authStore.logout();
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
            Search by Participant Name
          </label>
          <form @submit.prevent="handleSearch" class="flex gap-3">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Type participant name"
              class="bg-gray-50 border-2 border-gray-300 h-14 px-5 text-base focus:border-[#2563FF] flex-1"
            />
            <Button 
              type="submit"
              class="bg-gradient-to-r from-[#2563FF] to-[#7C3AED] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white h-14 px-8 font-semibold shadow-lg"
            >
              <Search class="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>
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
                    <th class="px-6 py-4 text-left text-sm font-semibold">Class</th>
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
                    <td class="px-6 py-4 text-sm text-gray-600">{{ result.class }}</td>
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
                      <div class="text-xs text-gray-600 mb-1">Class</div>
                      <div class="text-sm text-gray-900">{{ result.class }}</div>
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

<script setup lang="ts">
// AdminLayout with sidebar - placeholder for now
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar placeholder -->
    <div class="w-64 bg-gray-900 text-white p-4">
      <div class="font-bold">Admin Sidebar</div>
    </div>
    
    <!-- Main content -->
    <div class="flex-1">
      <RouterView />
    </div>
  </div>
</template>

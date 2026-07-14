<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const auth = useAuthStore();
onMounted(() => auth.initFromStorage());
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <RouterView />
    <Toaster />
  </div>
</template>

<!-- AdminLayout.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const auth = useAuthStore();
const route = useRoute();

const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/aduan', label: 'Daftar Aduan' },
];
</script>

<template>
    <div class="min-h-screen bg-background">
        <header class="border-b">
            <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <h1 class="font-bold text-lg">Pancen Jateng</h1>
                    <nav class="flex gap-4">
                        <router-link
                            v-for="item in navItems"
                            :key="item.path"
                            :to="item.path"
                            class="text-sm"
                            :class="route.path === item.path ? 'text-primary font-medium' : 'text-muted-foreground'"
                        >
                            {{ item.label }}
                        </router-link>
                    </nav>
                </div>
                <Button variant="ghost" size="sm" @click="auth.logout()">Logout</Button>
            </div>
        </header>
        <main class="max-w-7xl mx-auto px-4 py-6">
            <slot />
        </main>
    </div>
</template>

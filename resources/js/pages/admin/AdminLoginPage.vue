<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
    loading.value = true;
    error.value = '';
    try {
        await auth.login(email.value, password.value);
        router.push('/admin');
    } catch (e: any) {
        if (e.response?.status === 401) {
            error.value = 'Email atau password salah.';
        } else {
            error.value = 'Terjadi kesalahan sistem. Silakan coba lagi.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card class="w-full max-w-md border shadow-lg">
            <CardHeader class="space-y-1">
                <CardTitle class="text-2xl font-bold text-center">Login Admin</CardTitle>
                <CardDescription class="text-center">
                    Masuk ke Dashboard Pengaduan Pancen Jateng
                </CardDescription>
            </CardHeader>
            <form @submit.prevent="handleLogin">
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input id="email" v-model="email" type="email" placeholder="admin@pancenjateng.id" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
                    </div>
                    <p v-if="error" class="text-sm text-destructive text-center">{{ error }}</p>
                </CardContent>
                <CardFooter>
                    <Button class="w-full" type="submit" :disabled="loading">
                        {{ loading ? 'Memproses...' : 'Masuk' }}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
</template>

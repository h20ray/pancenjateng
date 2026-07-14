<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();
const ticket = route.params.ticket as string;
</script>

<template>
    <div class="max-w-lg mx-auto py-16 px-4 text-center">
        <div class="text-4xl mb-4">✅</div>
        <h1 class="text-2xl font-bold mb-2">Laporan Terkirim!</h1>
        <p class="text-muted-foreground mb-6">Laporan Anda telah diterima dan akan segera ditindaklanjuti.</p>

        <div class="bg-muted rounded-lg p-6 mb-6 border">
            <p class="text-sm text-muted-foreground mb-1">Nomor Tiket Anda</p>
            <p class="text-2xl font-mono font-bold text-primary">{{ ticket }}</p>
        </div>

        <p class="text-sm text-muted-foreground mb-6">
            Simpan nomor tiket untuk melacak status laporan Anda.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" @click="router.push('/lapor')">Buat Laporan Baru</Button>
            <Button @click="router.push('/lacak')">Lacak Laporan →</Button>
        </div>
    </div>
</template>

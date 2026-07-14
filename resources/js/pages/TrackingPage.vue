<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusLabel, statusVariant } from '@/lib/constants';
import api from '@/services/api';

const ticket = ref('');
const phone = ref('');
const loading = ref(false);
const result = ref<any>(null);
const error = ref('');

async function track() {
    loading.value = true;
    error.value = '';
    result.value = null;

    try {
        const { data } = await api.get('/aduan/track', {
            params: { ticket: ticket.value, phone: phone.value.replace(/\D/g, '') },
        });
        result.value = data;
    } catch (e: any) {
        if (e.response?.status === 404) {
            error.value = 'Laporan tidak ditemukan. Periksa nomor tiket dan WA Anda.';
        } else {
            error.value = 'Gagal melacak. Coba lagi.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto py-16 px-4">
        <h1 class="text-2xl font-bold text-center mb-2">Lacak Laporan</h1>
        <p class="text-muted-foreground text-center mb-8">Masukkan nomor tiket dan nomor WA yang digunakan saat melapor.</p>

        <div class="space-y-4 mb-6">
            <div class="space-y-2">
                <Label for="ticket">Nomor Tiket</Label>
                <Input id="ticket" v-model="ticket" placeholder="ADN-20260714-0001" />
            </div>
            <div class="space-y-2">
                <Label for="track-phone">Nomor WhatsApp</Label>
                <Input id="track-phone" v-model="phone" placeholder="0812xxxxxxxx" />
            </div>
            <Button class="w-full" :disabled="!ticket || !phone || loading" @click="track">
                {{ loading ? 'Mencari...' : 'Lacak' }}
            </Button>
        </div>

        <p v-if="error" class="text-destructive text-center text-sm mb-6">{{ error }}</p>

        <Card v-if="result" class="border">
            <CardHeader>
                <CardTitle class="text-lg">Status Laporan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Tiket:</span>
                    <span class="font-mono font-medium">{{ result.ticket_number }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Status:</span>
                    <Badge :variant="statusVariant[result.status]">{{ statusLabel[result.status] }}</Badge>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Kab/Kota:</span>
                    <span>{{ result.kabupaten_kota }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Jenis:</span>
                    <span>{{ result.jenis_rokok }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Dilaporkan:</span>
                    <span>{{ new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

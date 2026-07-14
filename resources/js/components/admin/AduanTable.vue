<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusLabel, statusVariant } from '@/lib/constants';
import { useRouter } from 'vue-router';

defineProps<{
    aduans: any[];
}>();

const router = useRouter();
</script>

<template>
    <div class="rounded-md border overflow-hidden">
        <Table>
            <TableHeader class="bg-muted/40">
                <TableRow>
                    <TableHead>No Tiket</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Kab/Kota</TableHead>
                    <TableHead>Jenis Rokok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead class="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow 
                    v-for="aduan in aduans" 
                    :key="aduan.id" 
                    class="cursor-pointer hover:bg-muted/50"
                    @click="router.push(`/admin/aduan/${aduan.id}`)"
                >
                    <TableCell class="font-mono font-medium">{{ aduan.ticket_number }}</TableCell>
                    <TableCell>{{ aduan.nama_pelapor }}</TableCell>
                    <TableCell>{{ aduan.kabupaten_kota }}</TableCell>
                    <TableCell class="capitalize">{{ aduan.jenis_rokok.replace('_', ' ') }}</TableCell>
                    <TableCell>
                        <Badge :variant="statusVariant[aduan.status]">{{ statusLabel[aduan.status] || aduan.status }}</Badge>
                    </TableCell>
                    <TableCell>{{ new Date(aduan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</TableCell>
                    <TableCell class="text-right" @click.stop>
                        <Button variant="ghost" size="sm" type="button" @click="router.push(`/admin/aduan/${aduan.id}`)">
                            Detail →
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow v-if="aduans.length === 0">
                    <TableCell colspan="7" class="text-center py-10 text-muted-foreground">Tidak ada laporan ditemukan.</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>

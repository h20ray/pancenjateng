<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusVariant } from '@/lib/constants';
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
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.ticket_no') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.reporter') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.city') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.cigarette_type') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.status') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.date') }}</TableHead>
                    <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{{ $t('label.action') }}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow 
                    v-for="aduan in aduans" 
                    :key="aduan.id" 
                    class="cursor-pointer hover:bg-muted/30"
                    @click="router.push(`/admin/aduan/${aduan.id}`)"
                >
                    <TableCell class="px-5 py-3.5 font-mono font-medium">{{ aduan.ticket_number }}</TableCell>
                    <TableCell class="px-5 py-3.5">{{ aduan.nama_pelapor }}</TableCell>
                    <TableCell class="px-5 py-3.5">{{ aduan.kabupaten_kota }}</TableCell>
                    <TableCell class="px-5 py-3.5 capitalize">{{ $t('label.jenis_' + aduan.jenis_rokok) }}</TableCell>
                    <TableCell class="px-5 py-3.5">
                        <Badge :variant="statusVariant[aduan.status]">{{ $t('label.status_' + aduan.status) }}</Badge>
                    </TableCell>
                    <TableCell class="px-5 py-3.5">{{ new Date(aduan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</TableCell>
                    <TableCell class="px-5 py-3.5 text-right" @click.stop>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            type="button" 
                            class="flex items-center gap-1 ml-auto text-xs font-semibold hover:bg-primary/10 hover:text-primary rounded-lg"
                            @click="router.push(`/admin/aduan/${aduan.id}`)"
                        >
                            {{ $t('button.detail') }}
                            <i class="ki-outline ki-arrow-right text-xs"></i>
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow v-if="aduans.length === 0">
                    <TableCell colspan="7" class="text-center py-10 text-muted-foreground">{{ $t('message.no_reports_found') }}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

defineProps<{
    stats: {
        total: number;
        hari_ini: number;
        minggu_ini: number;
        bulan_ini: number;
    }
}>();
</script>

<template>
    <div class="grid gap-4 md:grid-cols-4">
        <Card class="border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Laporan</CardTitle>
                <div class="text-muted-foreground text-lg">📊</div>
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">{{ stats.total }}</div>
                <p class="text-xs text-muted-foreground">Semua laporan terdaftar</p>
            </CardContent>
        </Card>

        <Card class="border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Hari Ini</CardTitle>
                <div class="text-muted-foreground text-lg">📅</div>
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.hari_ini }}</div>
                <p class="text-xs text-muted-foreground">Laporan masuk hari ini</p>
            </CardContent>
        </Card>

        <Card class="border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Minggu Ini</CardTitle>
                <div class="text-muted-foreground text-lg">⏳</div>
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ stats.minggu_ini }}</div>
                <p class="text-xs text-muted-foreground">Laporan masuk minggu ini</p>
            </CardContent>
        </Card>

        <Card class="border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Bulan Ini</CardTitle>
                <div class="text-muted-foreground text-lg">🗓️</div>
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.bulan_ini }}</div>
                <p class="text-xs text-muted-foreground">Laporan masuk bulan ini</p>
            </CardContent>
        </Card>
    </div>
</template>

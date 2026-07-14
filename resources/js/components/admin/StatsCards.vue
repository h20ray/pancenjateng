<!-- StatsCards.vue -->
<script setup lang="ts">
defineProps<{
    stats: {
        total: number;
        hari_ini: number;
        minggu_ini: number;
        bulan_ini: number;
    }
}>();

const cardConfig = [
    {
        key: 'total',
        labelKey: 'dashboard.stats_total',
        icon: 'ki-chart-line',
        bgClass: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        key: 'hari_ini',
        labelKey: 'dashboard.stats_today',
        icon: 'ki-calendar',
        bgClass: 'bg-blue-100 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        key: 'minggu_ini',
        labelKey: 'dashboard.stats_week',
        icon: 'ki-time',
        bgClass: 'bg-amber-100 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
        key: 'bulan_ini',
        labelKey: 'dashboard.stats_month',
        icon: 'ki-calendar-8',
        bgClass: 'bg-green-100 dark:bg-green-950/40',
        iconColor: 'text-green-600 dark:text-green-400',
    },
] as const;
</script>

<template>
    <div class="grid gap-5 md:grid-cols-4 select-none">
        <div 
            v-for="card in cardConfig" 
            :key="card.key" 
            class="flex items-center gap-4 bg-card border border-border shadow-xs rounded-xl px-5 py-5"
        >
            <div :class="['flex items-center justify-center shrink-0 size-[42px] rounded-xl', card.bgClass]">
                <i :class="['ki-outline', card.icon, 'text-xl', card.iconColor]"></i>
            </div>
            <div class="flex flex-col text-left">
                <span class="text-3xl font-semibold text-foreground leading-none mb-1">
                    {{ stats[card.key] }}
                </span>
                <span class="text-sm text-muted-foreground font-medium leading-none">
                    {{ $t(card.labelKey) }}
                </span>
            </div>
        </div>
    </div>
</template>

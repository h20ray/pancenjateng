<!-- AdminLayout.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const route = useRoute();
const { t } = useI18n();

// Theme management using VueUse
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});
const toggleDark = useToggle(isDark);

// Mobile drawer visibility state
const isDrawerOpen = ref(false);

// Auto-close drawer on route change
watch(() => route.path, () => {
    isDrawerOpen.value = false;
});

// Sidebar menu configuration using KeenIcons classes
const menuItems = computed(() => [
    { path: '/admin', label: t('menu.dashboard'), iconClass: 'ki-element-11' },
    { path: '/admin/aduan', label: t('menu.aduan_list'), iconClass: 'ki-document' },
]);

// Computed dynamic page headers
const pageTitle = computed(() => {
    if (route.path === '/admin') return t('menu.overview_dashboard');
    if (route.path === '/admin/aduan') return t('menu.aduan_list_title');
    if (route.path.startsWith('/admin/aduan/')) return t('menu.aduan_detail_title');
    return t('menu.admin_panel');
});

// Computed dynamic page descriptions
const pageDescription = computed(() => {
    if (route.path === '/admin') return t('menu.overview_dashboard_desc');
    if (route.path === '/admin/aduan') return t('menu.aduan_list_desc');
    if (route.path.startsWith('/admin/aduan/')) return t('menu.aduan_detail_desc');
    return '';
});

// Computed dynamic breadcrumbs
const breadcrumbs = computed(() => {
    const list = [{ label: t('menu.admin'), path: '/admin' }];
    if (route.path === '/admin/aduan') {
        list.push({ label: t('menu.aduan_list'), path: '/admin/aduan' });
    } else if (route.path.startsWith('/admin/aduan/')) {
        list.push({ label: t('menu.aduan_list'), path: '/admin/aduan' });
        list.push({ label: t('menu.detail'), path: route.path });
    } else {
        list.push({ label: t('menu.dashboard'), path: '/admin' });
    }
    return list;
});

function handleSearch() {
    // Mock search event
}
</script>

<template>
    <div class="min-h-screen bg-muted/40 dark:bg-muted/10 text-foreground flex flex-col font-sans antialiased">
        
        <!-- ================= TOP HEADER NAVBAR ================= -->
        <!-- Fixed top header (Left offset by sidebar width on desktop) -->
        <header class="header fixed top-0 z-10 lg:start-[280px] start-0 end-0 flex items-center h-[70px] bg-background border-b border-border select-none shadow-2xs">
            <div class="w-full max-w-[1280px] mx-auto flex justify-between items-center px-5 sm:px-6 lg:px-7.5">
                <!-- Left Side: Mobile branding or desktop top menu -->
                <div class="flex items-center gap-3">
                    <!-- Mobile Logo (hidden on desktop) -->
                    <div class="flex lg:hidden items-center gap-2.5">
                        <img :src="'/media/app/mini-logo-circle-primary.svg'" class="h-8 w-8 shrink-0" :alt="$t('label.app_logo')" />
                        <span class="text-sm font-bold tracking-tight text-foreground leading-none hidden xs:inline">{{ $t('label.app_name') }}</span>
                    </div>

                    <!-- Toggle Sidebar Control for Mobile -->
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        @click="isDrawerOpen = true" 
                        type="button"
                        class="lg:hidden text-muted-foreground hover:text-foreground rounded-lg"
                    >
                        <i class="ki-outline ki-menu text-xl"></i>
                    </Button>

                    <!-- Desktop Left Header Menu (Sleek Metronic style) -->
                    <div class="hidden lg:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                        <span class="text-foreground font-semibold">{{ $t('label.portal_title') }}</span>
                        <span class="h-4 w-px bg-border"></span>
                        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{{ $t('label.government_name') }}</span>
                    </div>
                </div>

                <!-- Right Side Topbar Actions -->
                <div class="flex items-center gap-3 sm:gap-4">
                    <!-- Theme toggler -->
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        class="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        @click="toggleDark()"
                        type="button"
                    >
                        <i v-if="isDark" class="ki-outline ki-sun text-amber-500 animate-pulse text-lg"></i>
                        <i v-else class="ki-outline ki-moon text-lg"></i>
                    </Button>

                    <!-- Divider -->
                    <span class="h-6 w-px bg-border hidden sm:block shrink-0"></span>

                    <!-- User Profile info -->
                    <div class="flex items-center gap-2.5">
                        <img 
                            :src="'/media/avatars/300-2.png'" 
                            class="h-9 w-9 rounded-full border-2 border-green-500 shrink-0" 
                            :alt="$t('label.admin_fallback')"
                        />
                        <div class="hidden md:flex flex-col text-left overflow-hidden max-w-[120px]">
                            <span class="text-xs font-bold text-foreground leading-none truncate">{{ auth.user?.name || $t('label.admin_fallback') }}</span>
                            <span class="text-[9px] text-muted-foreground leading-none mt-1 truncate">{{ auth.user?.email || 'admin@pancenjateng.id' }}</span>
                        </div>
                    </div>

                    <!-- Logout Button -->
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        class="rounded-lg text-muted-foreground hover:text-destructive shrink-0" 
                        @click="auth.logout()" 
                        type="button"
                    >
                        <i class="ki-outline ki-exit-right text-lg"></i>
                    </Button>
                </div>
            </div>
        </header>

        <!-- ================= MOBILE DRAWER BACKDROP & SHELL ================= -->
        <!-- Backdrop Overlay -->
        <div 
            v-if="isDrawerOpen" 
            @click="isDrawerOpen = false" 
            class="fixed inset-0 bg-background/80 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden"
        ></div>

        <!-- Drawer Content Container (Uses dark theme sidebar layout) -->
        <aside 
            class="fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[280px] bg-sidebar border-r border-sidebar-border shadow-lg transition-transform duration-300 ease-in-out lg:hidden"
            :class="isDrawerOpen ? 'translate-x-0' : '-translate-x-full'"
        >
            <!-- Drawer Header -->
            <div class="flex items-center justify-between px-4 h-[70px] border-b border-sidebar-border shrink-0 select-none bg-sidebar">
                <div class="flex items-center gap-2.5">
                    <img :src="'/media/app/mini-logo-circle-primary.svg'" class="h-9 w-9 shrink-0" :alt="$t('label.app_logo')" />
                    <div class="flex flex-col text-left">
                        <span class="text-sm font-bold tracking-tight text-foreground leading-none mb-1">{{ $t('label.app_name') }}</span>
                        <span class="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">{{ $t('label.province_short') }}</span>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    @click="isDrawerOpen = false" 
                    type="button"
                    class="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/10"
                >
                    <i class="ki-outline ki-cross text-base"></i>
                </Button>
            </div>

            <!-- Drawer Menu Links -->
            <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6 bg-sidebar">
                <div class="relative">
                    <i class="ki-outline ki-magnifier absolute top-1/2 start-3.5 -translate-y-1/2 text-muted-foreground text-sm"></i>
                    <Input 
                        :placeholder="$t('label.search_placeholder')" 
                        class="pl-9 pr-3 h-8.5 text-xs rounded-lg bg-background/5 border-border/10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
                        @input="handleSearch"
                    />
                </div>

                <div class="space-y-1.5">
                    <span class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3.5 select-none">{{ $t('menu.admin_section') }}</span>
                    <router-link 
                        v-for="item in menuItems" 
                        :key="item.path" 
                        :to="item.path"
                        class="flex items-center gap-3 px-3.5 h-10 rounded-lg text-sm transition-all border border-transparent"
                        :class="route.path === item.path 
                            ? 'bg-accent/60 text-primary font-semibold' 
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'"
                    >
                        <i :class="['ki-outline', item.iconClass, 'text-lg shrink-0']"></i>
                        <span>{{ item.label }}</span>
                    </router-link>
                </div>
            </div>
        </aside>

        <!-- ================= DESKTOP FIXED SIDEBAR ================= -->
        <aside class="fixed top-0 bottom-0 left-0 z-20 hidden lg:flex flex-col shrink-0 w-[280px] bg-sidebar border-r border-sidebar-border select-none">
            <!-- Sidebar Header Brand -->
            <div class="flex items-center justify-between gap-2.5 px-4 h-[70px] shrink-0 border-b border-sidebar-border bg-sidebar">
                <router-link to="/admin" class="flex items-center gap-2.5">
                    <img :src="'/media/app/mini-logo-circle-primary.svg'" class="h-9 w-9 shrink-0" :alt="$t('label.app_logo')" />
                    <div class="flex flex-col text-left">
                        <span class="text-sm font-bold tracking-tight text-foreground leading-none mb-1">{{ $t('label.app_name') }}</span>
                        <span class="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">{{ $t('label.province_short') }}</span>
                    </div>
                </router-link>
            </div>

            <!-- Sidebar Menu Scroll Area -->
            <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-sidebar">
                <!-- Group Menu -->
                <div class="space-y-1.5">
                    <span class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3.5 select-none">{{ $t('menu.dashboard_section') }}</span>
                    <router-link 
                        v-for="item in menuItems" 
                        :key="item.path" 
                        :to="item.path"
                        class="flex items-center gap-3 px-3.5 h-10 rounded-lg text-sm transition-all border border-transparent"
                        :class="route.path === item.path 
                            ? 'bg-accent/60 text-primary font-semibold' 
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'"
                    >
                        <i :class="['ki-outline', item.iconClass, 'text-lg shrink-0']"></i>
                        <span>{{ item.label }}</span>
                    </router-link>
                </div>
            </div>
        </aside>

        <!-- ================= MAIN CONTENT WRAPPER ================= -->
        <!-- Content wrapper shifts left on desktop, pt-[70px] below header -->
        <div class="flex flex-col grow pt-[70px] lg:pl-[280px]">
            <div class="flex-1 flex flex-col w-full max-w-[1280px] mx-auto p-5 sm:p-6 lg:p-7.5 space-y-7.5">
                
                <!-- ================= DEDICATED TOOLBAR ================= -->
                <div class="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5 border-b border-border select-none">
                    <div class="flex flex-col gap-1.5 text-left">
                        <!-- Breadcrumbs list -->
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                                <router-link 
                                    :to="crumb.path" 
                                    class="hover:text-primary transition-colors"
                                    :class="idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''"
                                >
                                    {{ crumb.label }}
                                </router-link>
                                <span v-if="idx < breadcrumbs.length - 1" class="flex items-center"><i class="ki-outline ki-right text-3xs text-muted-foreground"></i></span>
                            </template>
                        </div>
                        <!-- Page Title -->
                        <h1 class="text-xl font-medium leading-none text-foreground mt-0.5">{{ pageTitle }}</h1>
                        <!-- Description line after title -->
                        <p class="text-sm font-normal text-muted-foreground mt-1">{{ pageDescription }}</p>
                    </div>

                    <!-- Toolbar Actions -->
                    <div class="flex items-center flex-wrap gap-2.5">
                        <slot name="actions"></slot>
                    </div>
                </div>

                <!-- ================= CORE VIEW SLOT (Spacious nested layout cards) ================= -->
                <main class="grow flex flex-col items-stretch">
                    <slot />
                </main>

                <!-- ================= DASHBOARD FOOTER ================= -->
                <footer class="flex flex-col md:flex-row justify-between py-5 text-sm text-muted-foreground select-none shrink-0">
                    <div>
                        {{ $t('label.footer_copyright') }}
                    </div>
                    <div class="flex items-center gap-4">
                        <a href="#" class="hover:text-primary transition-colors">{{ $t('menu.footer_guide') }}</a>
                        <a href="#" class="hover:text-primary transition-colors">{{ $t('menu.footer_help') }}</a>
                        <a href="#" class="hover:text-primary transition-colors">{{ $t('menu.footer_privacy') }}</a>
                    </div>
                </footer>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import { Loader2 } from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const router = useRouter();
const { t } = useI18n();

// Dark mode management using VueUse
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});
const toggleDark = useToggle(isDark);

const email = ref('');
const password = ref('');
const passwordVisible = ref(false);
const rememberMe = ref(false);
const error = ref('');
const loading = ref(false);

async function handleLogin() {
    if (!email.value || !password.value) {
        error.value = t('message.fill_credentials');
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        await auth.login(email.value, password.value);
        router.push('/admin');
    } catch (e: any) {
        if (e.response?.status === 401) {
            error.value = t('message.invalid_credentials');
        } else {
            error.value = t('message.system_error');
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="grid lg:grid-cols-2 grow min-h-screen bg-background relative overflow-x-hidden select-none">
        <!-- Floating Theme Switcher -->
        <div class="absolute top-4 right-4 z-50">
            <Button 
                variant="outline" 
                size="icon" 
                @click="toggleDark()" 
                type="button"
                class="rounded-full shadow-xs bg-background/80 backdrop-blur-xs border border-border hover:bg-muted"
                :aria-label="$t('button.toggle_theme')"
            >
                <i v-if="isDark" class="ki-outline ki-sun text-amber-500 animate-pulse text-lg"></i>
                <i v-else class="ki-outline ki-moon text-lg text-slate-700"></i>
            </Button>
        </div>

        <!-- Form Column (Left Column on large screens, Bottom / Order 2 on mobile) -->
        <div class="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1 relative min-h-screen">
            <Card class="w-full max-w-[400px] border shadow-xs">
                <CardContent class="p-6 space-y-5">
                    <!-- Branding & Title -->
                    <div class="flex flex-col gap-4">
                        <!-- Brand Logo for mobile display (Hidden on large screens) -->
                        <div class="flex lg:hidden items-center justify-center gap-2 mb-1">
                            <img :src="'/media/app/mini-logo-circle-primary.svg'" class="h-9 w-9 shrink-0" :alt="$t('label.app_logo')" />
                            <div class="flex flex-col text-left">
                                <span class="text-lg font-bold tracking-tight text-foreground leading-none">{{ $t('label.app_name') }}</span>
                                <span class="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{{ $t('label.app_province') }}</span>
                            </div>
                        </div>
                        
                        <div class="space-y-1.5 text-center lg:text-left">
                            <h1 class="text-2xl font-semibold tracking-tight text-foreground">{{ $t('auth.login_title') }}</h1>
                            <p class="text-sm text-muted-foreground">
                                {{ $t('auth.login_subtitle') }}
                            </p>
                        </div>
                    </div>

                    <!-- Alert Message -->
                    <div v-if="error" class="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <i class="ki-outline ki-information-2 text-lg shrink-0 text-destructive"></i>
                        <span class="font-medium text-xs">{{ error }}</span>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="handleLogin" class="space-y-4">
                        <!-- Email field -->
                        <div class="space-y-1.5">
                            <Label for="email" class="text-sm font-medium text-foreground">{{ $t('label.email') }}</Label>
                            <Input 
                                id="email" 
                                v-model="email" 
                                type="email" 
                                :placeholder="$t('label.email_placeholder')" 
                                required 
                                class="h-10 rounded-lg focus-visible:ring-2 focus-visible:ring-primary" 
                            />
                        </div>

                        <!-- Password field -->
                        <div class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <Label for="password" class="text-sm font-medium text-foreground">{{ $t('label.password') }}</Label>
                            </div>
                            <div class="relative">
                                <Input 
                                    id="password" 
                                    v-model="password" 
                                    :type="passwordVisible ? 'text' : 'password'" 
                                    :placeholder="$t('label.password_placeholder')" 
                                    required 
                                    class="h-10 rounded-lg pr-10 focus-visible:ring-2 focus-visible:ring-primary" 
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    @click="passwordVisible = !passwordVisible"
                                    class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                >
                                    <i :class="passwordVisible ? 'ki-outline ki-eye-slash text-lg' : 'ki-outline ki-eye text-lg'"></i>
                                </Button>
                            </div>
                        </div>

                        <!-- Remember me check -->
                        <div class="flex items-center space-x-2 py-1">
                            <Checkbox id="remember" v-model:checked="rememberMe" />
                            <label 
                                for="remember" 
                                class="text-xs font-semibold text-muted-foreground cursor-pointer select-none leading-none"
                            >
                                {{ $t('auth.remember_me') }}
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <Button 
                            class="w-full h-10 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs" 
                            type="submit" 
                            :disabled="loading"
                        >
                            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
                            {{ loading ? $t('auth.logging_in') : $t('auth.login_btn') }}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        <!-- Banner Section (Right Column on large screens, Hidden on mobile) -->
        <div class="hidden lg:flex flex-col justify-between p-12 lg:p-16 lg:m-5 lg:rounded-xl lg:border lg:border-border bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg order-1 lg:order-2 relative overflow-hidden select-none">
            <!-- Overlay to increase contrast on light mode -->
            <div class="absolute inset-0 bg-background/5 dark:bg-background/25 backdrop-blur-[1px] -z-10 pointer-events-none"></div>

            <div class="flex flex-col gap-6 relative z-10">
                <!-- Branding header -->
                <div class="flex items-center gap-3">
                    <img :src="'/media/app/mini-logo-circle-primary.svg'" class="h-12 w-12 shrink-0 shadow-sm" :alt="$t('label.app_logo')" />
                    <div class="flex flex-col text-left">
                        <span class="text-2xl font-bold tracking-tight text-foreground leading-none mb-1">{{ $t('label.app_name') }}</span>
                        <span class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{{ $t('label.app_province') }}</span>
                    </div>
                </div>

                <!-- App Slogan -->
                <div class="flex flex-col gap-3 mt-12 max-w-[460px]">
                    <h2 class="text-2xl font-semibold tracking-tight text-foreground leading-tight">
                        {{ $t('auth.banner_title') }}
                    </h2>
                    <p class="text-sm text-muted-foreground leading-relaxed font-normal">
                        {{ $t('auth.banner_description') }}
                    </p>
                </div>
            </div>

            <!-- Bottom Banner Info -->
            <div class="relative z-10 flex flex-col gap-2 mt-auto">
                <span class="text-sm font-bold text-foreground">
                    {{ $t('auth.banner_footer_title') }}
                </span>
                <p class="text-xs text-muted-foreground max-w-[440px]">
                    {{ $t('auth.banner_footer_description') }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.branded-bg {
    background-image: url('/media/images/2600x1600/1.png');
}
:global(.dark) .branded-bg {
    background-image: url('/media/images/2600x1600/1-dark.png');
}
</style>

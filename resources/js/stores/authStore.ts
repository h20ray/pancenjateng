import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '');
    const user = ref<any>(null);

    const isAuthenticated = computed(() => !!token.value);

    async function login(email: string, password: string) {
        const { data } = await api.post('/admin/login', { email, password });
        token.value = data.token;
        user.value = data.user;
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }

    function logout() {
        api.post('/admin/logout').catch(() => {});
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        router.push('/admin/login');
    }

    function initFromStorage() {
        if (token.value) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        }
    }

    return { token, user, isAuthenticated, login, logout, initFromStorage };
});

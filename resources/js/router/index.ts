import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes = [
    { path: '/', redirect: '/lapor' },
    { path: '/lapor', component: () => import('@/pages/WizardFormPage.vue') },
    { path: '/lapor/berhasil/:ticket', component: () => import('@/pages/SuccessPage.vue'), name: 'success' },
    { path: '/lacak', component: () => import('@/pages/TrackingPage.vue') },
    { path: '/admin/login', component: () => import('@/pages/admin/AdminLoginPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/AdminDashboardPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin/aduan', component: () => import('@/pages/admin/AdminAduanListPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin/aduan/:id', component: () => import('@/pages/admin/AdminAduanDetailPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    if (!authStore.token) {
        authStore.initFromStorage();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/admin/login');
    }
    
    if (to.path === '/admin/login' && authStore.isAuthenticated) {
        return next('/admin');
    }

    next();
});

export default router;

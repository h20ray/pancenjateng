import axios from 'axios';
import { getStoredToken, removeStoredToken, removeStoredUser } from '@/auth/lib/helpers';
import { getData } from '@/lib/storage';
import { I18N_CONFIG_KEY } from '@/i18n/config';
import type { Language } from '@/i18n/types';

const api = axios.create({ baseURL: '/api' });

function getCurrentLocale(): string {
  const lang = getData(I18N_CONFIG_KEY) as Language | undefined;
  return lang?.code ?? 'id';
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-localization'] = getCurrentLocale();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeStoredToken();
      removeStoredUser();
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

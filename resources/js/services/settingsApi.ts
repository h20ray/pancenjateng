import api from './api';
import type { AppSettings } from '@/types/settings';

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await api.get('/admin/settings');
  return data;
}

export async function updateSettings(payload: Partial<AppSettings>): Promise<{ message: string }> {
  const { data } = await api.put('/admin/settings', payload);
  return data;
}

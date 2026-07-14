import api from './api';
import type { Aduan, DashboardStats, PaginatedAduan, AduanFilters } from '@/types/aduan';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function fetchAduans(filters: AduanFilters = {}): Promise<PaginatedAduan> {
  const { data } = await api.get('/admin/aduan', { params: filters });
  return data;
}

export async function fetchAduan(id: number): Promise<Aduan> {
  const { data } = await api.get(`/admin/aduan/${id}`);
  return data;
}

export async function updateAduanStatus(
  id: number,
  payload: { status: string; catatan_admin?: string },
): Promise<Aduan> {
  const { data } = await api.patch(`/admin/aduan/${id}`, payload);
  return data;
}

export async function deleteAduan(id: number): Promise<void> {
  await api.delete(`/admin/aduan/${id}`);
}

export async function resendWhatsapp(id: number): Promise<{ message: string; whatsapp_status: string; whatsapp_sent_at: string | null }> {
  const { data } = await api.post(`/admin/aduan/${id}/resend-wa`);
  return data;
}

export async function exportCsv(filters: AduanFilters = {}): Promise<void> {
  const response = await api.get('/admin/aduan/export', {
    params: filters,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  try {
    const link = document.createElement('a');
    link.href = url;
    const disposition = response.headers['content-disposition'];
    const filename = disposition?.match(/filename="?(.+)"?/)?.[1] ?? 'export.csv';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.URL.revokeObjectURL(url);
  }
}

export async function exportCsvSafe(filters: AduanFilters = {}): Promise<{ success: boolean; error?: string }> {
  try {
    await exportCsv(filters);
    return { success: true };
  } catch {
    return { success: false, error: 'Gagal mengekspor data CSV.' };
  }
}

export async function fetchKabupatenKota(): Promise<string[]> {
  const { data } = await api.get('/kabupaten-kota');
  return data;
}

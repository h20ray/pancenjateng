export interface Aduan {
  id: number;
  ticket_number: string;
  nama_pelapor: string;
  email: string | null;
  nomor_wa: string;
  jenis_rokok: string;
  kabupaten_kota: string;
  lokasi_kejadian: string;
  latitude: number | null;
  longitude: number | null;
  location_source: string | null;
  nama_toko: string | null;
  merk_rokok: string | null;
  detail_aduan: string;
  foto_bukti: string | null;
  status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  catatan_admin: string | null;
  whatsapp_sent_at: string | null;
  whatsapp_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
  per_status: {
    baru: number;
    diproses: number;
    selesai: number;
    ditolak: number;
  };
  per_kabupaten: Record<string, number>;
  terbaru: Aduan[];
}

export interface PaginatedAduan {
  data: Aduan[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AduanFilters {
  status?: string;
  kabupaten?: string;
  search?: string;
  jenis_rokok?: string;
  per_page?: number;
  page?: number;
}

export type AduanStatus = 'baru' | 'diproses' | 'selesai' | 'ditolak';

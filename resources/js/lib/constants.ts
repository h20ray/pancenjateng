import type { AduanStatus } from '@/types/aduan';

export const STATUS_VARIANT: Record<AduanStatus, 'primary' | 'warning' | 'success' | 'destructive'> = {
    baru: 'primary',
    diproses: 'warning',
    selesai: 'success',
    ditolak: 'destructive',
};

export const STATUS_LABEL: Record<AduanStatus, string> = {
    baru: 'Baru',
    diproses: 'Diproses',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
};

export const JENIS_ROKOK_OPTIONS = [
    { value: 'sigaret_mesin', label: 'Sigaret Mesin (SKM/SPM)' },
    { value: 'sigaret_tangan', label: 'Sigaret Tangan (SKT)' },
    { value: 'tembakau_iris', label: 'Tembakau Iris' },
    { value: 'cerutu', label: 'Cerutu' },
    { value: 'lainnya', label: 'Lainnya' },
] as const;

export const JENIS_ROKOK_FILTER_OPTIONS = [
    { value: '', label: 'Semua Jenis' },
    { value: 'sigaret_mesin', label: 'Sigaret Mesin' },
    { value: 'sigaret_tangan', label: 'Sigaret Tangan' },
    { value: 'tembakau_iris', label: 'Tembakau Iris' },
    { value: 'cerutu', label: 'Cerutu' },
    { value: 'lainnya', label: 'Lainnya' },
] as const;

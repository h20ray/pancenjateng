export const statusLabel: Record<string, string> = {
    baru: 'Baru',
    diproses: 'Sedang Diproses',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
};

export const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    baru: 'default',
    diproses: 'secondary',
    selesai: 'default',
    ditolak: 'destructive',
};

export const jenisLabel: Record<string, string> = {
    sigaret_mesin: 'Sigaret Mesin (SKM/SPM)',
    sigaret_tangan: 'Sigaret Tangan (SKT)',
    tembakau_iris: 'Tembakau Iris',
    cerutu: 'Cerutu',
    lainnya: 'Lainnya',
};

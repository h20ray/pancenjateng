# Pancen Jateng — Sistem Pengaduan Rokok Ilegal

**Tanggal:** 2026-07-14
**Status:** Approved Design → Ready for Implementation

---

## Ringkasan

Sistem pelaporan (whistleblower) rokok ilegal di Jawa Tengah. Warga melapor melalui form wizard 4 langkah. Laporan disimpan ke database + dikirim via WhatsApp ke admin. Admin mengelola laporan melalui dashboard.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, PHP 8.4, MariaDB |
| Frontend | Vue 3 (Composition API), Vite 8, TypeScript |
| UI | Tailwind CSS 4, shadcn-vue (Radix Vue) |
| State | Pinia 3 |
| Maps | Google Maps JS API (`@googlemaps/js-api-loader`) |
| WhatsApp | Fonnte Gateway (HTTP POST) |
| Testing | PHPUnit 11, Vitest 4 |

---

## Arsitektur

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   Public SPA            │     │   Admin SPA             │
│   /lapor (wizard 4 step)│     │   /admin (dashboard)    │
│   /lacak (tracking)     │     │   /admin/aduan (CRUD)   │
└──────────┬──────────────┘     └──────────┬──────────────┘
           │ REST API                      │ REST API (auth)
           ▼                               ▼
┌──────────────────────────────────────────────────────────┐
│                    Laravel 12 API                         │
│                                                          │
│  POST   /api/aduan            Submit complaint           │
│  GET    /api/aduan/track      Track by ticket+phone      │
│  POST   /api/aduan/upload     Upload photo (temp)        │
│  GET    /api/kabupaten-kota   List Jateng cities         │
│                                                          │
│  [Admin - Sanctum auth]                                  │
│  GET    /api/admin/aduan            List + filter        │
│  GET    /api/admin/aduan/{id}       Detail               │
│  PATCH  /api/admin/aduan/{id}       Update status        │
│  GET    /api/admin/dashboard        Stats                │
│  DELETE /api/admin/aduan/{id}       Soft delete          │
│  GET    /api/admin/aduan/export     Excel export         │
└──────────┬───────────────────────┬───────────────────────┘
           │                       │
           ▼                       ▼
     MariaDB (aduans)        Storage (foto_bukti)
           │
           ▼
     WhatsApp Gateway (Fonnte)
     POST recap ke nomor admin
```

---

## Data Model

### Tabel: `aduans`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint unsigned | Primary key |
| `ticket_number` | varchar(20) | Unique, format: `ADN-20260714-0001` |
| `nama_pelapor` | varchar(100) | Required |
| `email` | varchar(100) | Nullable |
| `nomor_wa` | varchar(20) | Required, 10-14 digit |
| `jenis_rokok` | enum | `sigaret_mesin`, `sigaret_tangan`, `tembakau_iris`, `cerutu`, `lainnya` |
| `kabupaten_kota` | varchar(50) | Required, dari daftar 35 kab/kota Jateng |
| `lokasi_kejadian` | text | Required, alamat bebas |
| `latitude` | decimal(10,7) | Nullable |
| `longitude` | decimal(10,7) | Nullable |
| `location_source` | enum | `gps`, `ip`, `manual`, default `manual` |
| `nama_toko` | varchar(150) | Required |
| `merk_rokok` | varchar(150) | Required |
| `detail_aduan` | text | Required, min 20 karakter |
| `foto_bukti` | varchar(255) | Nullable, path ke file |
| `status` | enum | `baru`, `diproses`, `selesai`, `ditolak`, default `baru` |
| `whatsapp_sent_at` | timestamp | Nullable |
| `whatsapp_status` | varchar(50) | Nullable, `sent`/`failed`/`pending` |
| `deleted_at` | timestamp | Soft delete |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### Tabel: `users` (admin)

Standar Laravel + Sanctum tokens.

### ENV Variables

```
GOOGLE_MAP_KEY=xxx
WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=xxx
WA_TARGET_NUMBER=62812xxxxxx
```

---

## Wizard Form — 4 Langkah

### Langkah 1: Identitas Pelapor

| Field | Validasi |
|---|---|
| Nama Pelapor | Required, min 3, max 100 |
| Email | Optional, valid email format |
| Nomor WA | Required, starts with 08/62, 10-14 digits after strip non-digit |

### Langkah 2: Lokasi Kejadian

| Field | Validasi |
|---|---|
| Kabupaten/Kota | Required, dropdown 35 kab/kota Jateng |
| Lokasi Kejadian | Required, min 10 karakter |
| Map Picker | Google Maps dengan marker draggable |
| -- Tombol "Gunakan Lokasi Saya" | Browser geolocation API |
| -- Search box | Places Autocomplete |
| Nama Toko | Required, min 3 karakter |

**GPS Fallback Chain:**
1. Browser Geolocation API → `location_source = gps`
2. Server-side IP geolocation (ipapi.co) → `location_source = ip`
3. Manual text only → `location_source = manual`

### Langkah 3: Detail Aduan

| Field | Validasi |
|---|---|
| Jenis Rokok Ilegal | Required, radio group |
| Merk Rokok | Required, min 2 karakter |
| Detail Aduan | Required, min 20 karakter |
| Upload Foto Bukti | Optional, max 2MB, jpg/png/webp |

Foto diupload dulu (POST `/api/aduan/upload`) → dapat path temporary → dikirim bersama submit final.

### Langkah 4: Konfirmasi & Submit

- Review semua data (read-only summary)
- Checkbox: "Saya menyatakan bahwa laporan ini benar dan dapat dipertanggungjawabkan"
- Tombol "Kirim Laporan" → loading state → disable tombol
- Double-submit prevention: disable + unique constraint check (same phone + same toko within 5 menit)
- On success: tampilkan ticket number + link lacak

---

## WhatsApp Integration

### Flow

```
POST /api/aduan sukses
        │
        ├── 1. Save ke DB
        ├── 2. Generate ticket number
        └── 3. Fire-and-forget WhatsApp
                    │
                    ▼
              App\Services\WhatsappService::sendRecap($aduan)
                    │
                    ▼
              Http::post(WA_GATEWAY_URL, [...])
                    │
                    ▼
              Update: whatsapp_sent_at, whatsapp_status
```

### Format Pesan WA

```
📢 *ADUAN BARU - Pancen Jateng*
🎫 Tiket: ADN-20260714-0001
📅 14 Juli 2026, 15:30 WIB

👤 *Pelapor*
Nama: Budi Santoso
WA: 6281234567890

📍 *Lokasi*
Kab/Kota: Semarang
Alamat: Jl. Pemuda No. 123, Kel. Sekayu
Toko: Toko Makmur
🗺️ Maps: https://maps.google.com/?q=-7.005,110.435

🚬 *Rokok*
Jenis: Sigaret Mesin
Merk: Gudang Garam

📝 *Detail*
Menjual rokok tanpa pita cukai dengan harga di bawah HJE. Sudah berlangsung 3 bulan.

🔍 Lacak: https://pancenjateng.id/lacak?tiket=ADN-20260714-0001
```

Jika WA gateway gagal: tetap return success ke user, `whatsapp_status = failed`, admin bisa retry dari dashboard.

---

## Halaman Tracking

**URL:** `/lacak`

Input: Ticket Number + Nomor WA
Output: Status aduan + detail ringkas

| Status | Arti |
|---|---|
| `baru` | Laporan diterima, belum diproses |
| `diproses` | Sedang ditindaklanjuti petugas |
| `selesai` | Selesai ditangani |
| `ditolak` | Laporan tidak dapat diproses (dengan catatan) |

---

## Admin Dashboard

### Halaman: Dashboard (`/admin`)

- Total laporan (hari ini, minggu ini, bulan ini, semua)
- Pie chart: per status
- Bar chart: per kabupaten/kota
- List 10 laporan terbaru
- Map view: semua laporan dengan marker (warna berdasarkan status)

### Halaman: Daftar Aduan (`/admin/aduan`)

- Table dengan kolom: ticket, pelapor, kab/kota, jenis, status, tanggal
- Filter: status, kab/kota, jenis rokok, tanggal
- Search: ticket number, nama pelapor
- Export Excel
- Pagination

### Halaman: Detail Aduan (`/admin/aduan/{id}`)

- Semua field + foto + map
- Update status (dropdown: baru → diproses → selesai / ditolak)
- Catatan admin (opsional, tidak ditampilkan ke public)
- Tombol "Kirim Ulang WA" jika whatsapp_status = failed
- Soft delete

---

## API Contract

### Public

```
POST /api/aduan
Body: {
  nama_pelapor: string,
  email: string|null,
  nomor_wa: string,
  jenis_rokok: string,
  kabupaten_kota: string,
  lokasi_kejadian: string,
  latitude: number|null,
  longitude: number|null,
  location_source: "gps"|"ip"|"manual",
  nama_toko: string,
  merk_rokok: string,
  detail_aduan: string,
  foto_bukti: string|null
}
Response 201: { ticket_number, status, created_at }
Response 422: { errors: {...} }

GET /api/aduan/track?ticket=ADN-xxx&phone=628xxx
Response 200: { ticket_number, status, nama_pelapor, kabupaten_kota,
                jenis_rokok, created_at, updated_at }
Response 404: { message: "Laporan tidak ditemukan" }

POST /api/aduan/upload
Body: multipart/form-data, field: foto (max 2MB, jpg/png/webp)
Response 201: { path: "temp/xxx.jpg" }

GET /api/kabupaten-kota
Response 200: [{ kode, nama }, ...]  // 35 entries
```

### Admin (Sanctum Bearer token)

```
GET    /api/admin/aduan?status=baru&kabupaten=semarang&search=xxx&page=1
GET    /api/admin/aduan/{id}
PATCH  /api/admin/aduan/{id}  { status, catatan_admin }
DELETE /api/admin/aduan/{id}
GET    /api/admin/aduan/export?status=baru&kabupaten=semarang  → Excel
GET    /api/admin/dashboard  → { total, per_status, per_kabupaten, terbaru[] }

POST   /api/admin/login  { email, password }
POST   /api/admin/logout
```

---

## Rute Frontend (Vue Router)

| Path | Komponen | Auth |
|---|---|---|
| `/` | Landing page (redirect ke `/lapor`) | No |
| `/lapor` | `WizardFormPage.vue` | No |
| `/lapor/berhasil/:ticket` | `SuccessPage.vue` | No |
| `/lacak` | `TrackingPage.vue` | No |
| `/admin/login` | `AdminLoginPage.vue` | No |
| `/admin` | `AdminDashboardPage.vue` | Yes |
| `/admin/aduan` | `AdminAduanListPage.vue` | Yes |
| `/admin/aduan/:id` | `AdminAduanDetailPage.vue` | Yes |

---

## Aturan Bisnis

1. **Satu orang bisa lapor berkali-kali** — tidak ada rate limit ketat, hanya deduplikasi soft (same phone + same toko dalam 5 menit)
2. **Foto opsional** — jika tidak ada foto, `foto_bukti` = null, tidak menghalangi submit
3. **WA fire-and-forget** — jika WA gagal, laporan tetap tersimpan. Admin bisa retry
4. **Data pelapor tidak ditampilkan public** — halaman lacak hanya tampilkan status, tidak tampilkan nama pelapor ke publik
5. **Soft delete** — data tidak dihapus permanen, hanya disembunyikan
6. **Ticket number immutable** — tidak bisa diubah setelah generate

---

## Kriteria Sukses (Verifiable)

1. `POST /api/aduan` dengan data valid → response 201 + ticket + WA terkirim
2. `POST /api/aduan` dengan data invalid → response 422 dengan error messages per field
3. Submit duplikat dalam 5 menit → response 409 dengan message "Laporan serupa sudah dikirim"
4. Tracking dengan ticket+phone benar → response 200 dengan status
5. Tracking dengan data salah → response 404
6. Admin filter aduan by status → hasil terfilter benar
7. Admin export Excel → file terdownload dengan data sesuai filter
8. Admin update status → status berubah, `updated_at` terupdate
9. Upload foto > 2MB → response 422
10. Wizard navigasi antar step tanpa kehilangan data (Pinia store persists)

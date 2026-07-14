# Pancen Jateng — Sistem Pengaduan Rokok Ilegal

Pancen Jateng adalah aplikasi Single Page Application (SPA) berbasis web untuk melaporkan peredaran dan penjualan rokok ilegal di wilayah Provinsi Jawa Tengah. Sistem ini mengintegrasikan data laporan masyarakat dengan pelacakan status, peta persebaran interaktif, serta notifikasi otomatis ke WhatsApp Grup Satpol PP melalui Fonnte API Gateway.

---

## 🚀 Fitur Utama

### 1. Portal Pelapor (Masyarakat)
- **Formulir Laporan Multi-Step (Wizard)**:
  - **Identitas Pelapor**: Nama pelapor, email (opsional), dan nomor WhatsApp.
  - **Lokasi Kejadian**: Pilih kabupaten/kota, alamat lengkap, dan nama toko.
  - **Detail Laporan**: Klasifikasi jenis rokok (SKM, SKT, Iris, Cerutu), merk rokok, foto bukti pelanggaran, dan deskripsi kejadian.
- **Pelacakan Status**: Halaman khusus untuk melacak status penanganan laporan secara real-time menggunakan nomor tiket aduan dan nomor WhatsApp pelapor.

### 2. Portal Admin (Satpol PP)
- **Dashboard Overview**:
  - KPI Stat Cards (Total Aduan, Hari Ini, Minggu Ini, Bulan Ini).
  - Breakdown status laporan aduan (Baru, Diproses, Selesai, Ditolak).
  - Daftar laporan terbaru dengan akses cepat ke detail.
- **Manajemen Aduan**:
  - Tabel log aduan dengan pencarian teks, pagination, serta filtrasi data berdasarkan status aduan dan jenis rokok.
  - Detail aduan lengkap termasuk foto bukti, koordinat peta, serta riwayat notifikasi WhatsApp.
  - Pembaruan status aduan (Baru → Diproses → Selesai / Ditolak) disertai penulisan catatan internal admin.
  - Export laporan aduan berformat **CSV** dengan UTF-8 BOM.
  - Fitur kirim ulang notifikasi WhatsApp jika terdapat kegagalan integrasi API.
  - Hapus aduan (soft delete) dengan konfirmasi dialog.

---

## 🌐 Navigasi & Alamat URL Halaman

Aplikasi ini berjalan sebagai Single Page Application (SPA) dengan router terpusat pada React Router v7. Berikut adalah alamat URL untuk masing-masing halaman:

| Halaman | URL | Keterangan |
| --- | --- | --- |
| **Landing Redirect** | `/` | Mengarahkan pelapor langsung ke halaman formulir laporan (`/lapor`). |
| **Formulir Laporan** | `/lapor` | Halaman multi-step wizard untuk membuat pengaduan rokok ilegal baru. |
| **Laporan Berhasil** | `/lapor/berhasil/:ticket` | Halaman konfirmasi setelah laporan berhasil dikirim (menampilkan nomor tiket). |
| **Pelacakan Laporan** | `/lacak` | Halaman tracking status aduan menggunakan nomor tiket & nomor WhatsApp. |
| **Login Admin** | `/auth/signin` | Halaman login otentikasi admin untuk masuk ke portal Satpol PP. |
| **Dashboard Admin** | `/admin` | Ringkasan statistik, bagan status, dan daftar laporan terbaru. |
| **Daftar Laporan Admin** | `/admin/aduan` | Kelola seluruh daftar aduan masuk, pencarian filter, dan export CSV. |
| **Detail Laporan Admin** | `/admin/aduan/:id` | Halaman penanganan detail aduan, pembaruan status, catatan admin, & kirim ulang WA. |

---

## 🔑 Kredensial Akses Masuk Admin (Default)

Untuk masuk ke Dashboard Admin, gunakan kredensial bawaan berikut setelah database berhasil di-seed:

- **Alamat URL**: `http://localhost:8000/auth/signin`
- **Email**: `admin@pancenjateng.id`
- **Password**: `password`

> [!WARNING]
> Sangat disarankan untuk segera mengubah email dan password bawaan ini saat pertama kali dideploy di server production demi alasan keamanan.

---

## 🛠️ Tech Stack & Arsitektur

- **Backend**:
  - Framework: Laravel 12 (PHP 8.2+)
  - Autentikasi: Laravel Sanctum (Token-Based API Guard)
  - Notifikasi Gateway: Fonnte WhatsApp API Gateway
  - Database: SQLite (default untuk local dev / testing) atau PostgreSQL/MySQL
- **Frontend**:
  - Library: React 19 (Functional Components + Hooks)
  - State Management: React Context + TanStack Query
  - Routing: React Router v7
  - Bundler: Vite 7 + laravel-vite-plugin
  - Styles: Tailwind CSS v4, Metronic demo1 Design System
  - UI Components: Radix UI primitives (88 components), shadcn-style
  - Forms: react-hook-form + zod validation
  - Icons: Lucide React, Remix Icon
  - Notifications: Sonner (toast)
  - Theme: next-themes (dark/light mode)
  - i18n: react-intl (id/en)
  - Charts: ApexCharts, Recharts
  - Maps: Leaflet + React Leaflet

---

## ⚙️ Persyaratan Sistem
- PHP >= 8.2 (dengan ekstensi pdo_sqlite, gd, curl, zip)
- Composer >= 2.0
- Node.js >= 20.x & npm
- Akun Fonnte API (untuk notifikasi WhatsApp)

---

## 💻 Instalasi Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/pancenjateng/pancenjateng.git
   cd pancenjateng
   ```

2. **Instal dependensi Backend (PHP/Laravel)**:
   ```bash
   composer install
   ```

3. **Instal dependensi Frontend (JS/Node)**:
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env` lalu sesuaikan isinya:
   ```bash
   copy .env.example .env
   ```
   *Tambahkan kredensial pihak ketiga berikut pada file `.env`:*
   ```env
   # WhatsApp Fonnte Gateway API
   FONNTE_TOKEN=your_fonnte_api_token
   FONNTE_TARGET=your_satpol_pp_group_or_number
   ```

5. **Jalankan Migrasi & Database Seeder**:
   Inisialisasi database lokal dan buat akun admin bawaan (`admin@pancenjateng.id` / `password`):
   ```bash
   php artisan migrate --seed
   ```

6. **Build Asset Frontend**:
   Kompilasi asset React dan Tailwind CSS untuk production:
   ```bash
   npm run build
   ```

7. **Jalankan Aplikasi**:
   Mulai server Laravel lokal:
   ```bash
   php artisan serve
   ```
   Secara default, aplikasi akan berjalan pada alamat [http://localhost:8000](http://localhost:8000).

---

## 🧪 Pengujian (Testing)

### Menjalankan Unit & Feature Tests
Aplikasi dilengkapi dengan rangkaian automated test lengkap yang meliputi pengujian validasi aduan, tracking status, autentikasi admin, update status, dan integrasi pengiriman WhatsApp:
```bash
php artisan test
```

### Type Checking & Lint Frontend
Untuk memeriksa validitas kode TypeScript dan React secara statis:
```bash
npx tsc --noEmit
npx eslint resources/js/
```

# Pancen Jateng — Sistem Pengaduan Rokok Ilegal

SPA berbasis web untuk pelaporan peredaran rokok ilegal di Provinsi Jawa Tengah.
Laporan masyarakat dilacak melalui nomor tiket, dipetakan secara interaktif, dan
dinotifikasi otomatis ke WhatsApp Grup Satpol PP via Fonnte API Gateway.

---

## Fitur

| Area | Fitur |
| --- | --- |
| **Portal Pelapor** | Form wizard 3-langkah (identitas → lokasi → detail), pelacakan status via tiket + WA |
| **Dashboard Admin** | KPI cards, breakdown per status, daftar laporan terbaru |
| **Manajemen Aduan** | Tabel dengan filter/pencarian/pagination, update status + catatan admin, export CSV, kirim ulang WA, soft delete |

---

## Navigasi URL

| Halaman | URL |
| --- | --- |
| Landing (redirect ke /lapor) | `/` |
| Formulir Laporan | `/lapor` |
| Konfirmasi Berhasil | `/lapor/berhasil/:ticket` |
| Pelacakan | `/lacak` |
| Login Admin | `/auth/signin` |
| Dashboard Admin | `/admin` |
| Daftar Aduan | `/admin/aduan` |
| Detail Aduan | `/admin/aduan/:id` |

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| **Backend** | Laravel 12, PHP 8.2+, Sanctum (token auth), Fonnte WA Gateway |
| **Frontend** | React 19, TanStack Query, React Router v7, react-hook-form + zod |
| **Bundler / CSS** | Vite 7, Tailwind CSS v4, Metronic demo1 Design System |
| **UI** | Radix UI + shadcn-vue, Lucide React, Sonner (toast) |
| **i18n** | react-intl (id / en) |
| **Database** | SQLite (dev), MySQL / PostgreSQL (production) |

---

## Persyaratan

- PHP ≥ 8.2 (ekstensi: `pdo_mysql`, `gd`, `curl`, `zip`, `fileinfo`)
- Composer ≥ 2.0
- Node.js ≥ 20 LTS & npm
- Akun [Fonnte](https://fonnte.com) (untuk notifikasi WhatsApp)

---

## Instalasi

### A. Lokal (Development)

```bash
git clone https://github.com/pancenjateng/pancenjateng.git
cd pancenjateng

# Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend
npm install
npm run build

# Jalankan
php artisan serve
```

Buka [http://localhost:8000](http://localhost:8000). Akun admin dibuat oleh
seeder sesuai nilai `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env` (default:
`admin@pancenjateng.id` / `password`).

---

### B. Plesk

#### 1. Upload & Atur Document Root

Upload seluruh isi repositori ke `httpdocs/` (atau subdomain folder) melalui
**File Manager** Plesk atau FTP/SFTP.

Setelah upload, **ubah Document Root** domain/subdomain ke:

```
httpdocs/public
```

Caranya: **Plesk → Websites & Domains → Hosting Settings → Document root**,
lalu akhiri dengan `/public`.

#### 2. Atur PHP & Ekstensi

Buka **Plesk → PHP Settings** untuk domain, lalu:
- Pilih versi **PHP 8.2** atau **8.3**
- Aktifkan ekstensi: `pdo_mysql`, `gd`, `curl`, `zip`, `fileinfo`, `openssl`

#### 3. Siapkan Database

Buka **Plesk → Databases** dan buat database MySQL. Catat **host**, **nama
database**, **user**, dan **password**.

#### 4. Konfigurasi `.env`

Buka `.env` di root project (via File Manager atau SSH) dan sesuaikan:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database

WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=token_fonnte_anda
WA_TARGET_NUMBER=08xxxxxxxxxx

ADMIN_EMAIL=admin@domain-anda.com
ADMIN_PASSWORD=password_aman
```

#### 5. Jalankan Composer & Migrasi (via SSH)

Buka **Plesk → SSH Terminal** (atau SSH client) dan jalankan:

```bash
cd /var/www/vhosts/domain-anda/httpdocs
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

#### 6. Build Frontend (dua opsi)

**Opsi A — Build di server** (Node.js harus tersedia):

```bash
npm install
npm run build
```

**Opsi B — Build lokal lalu upload** (jika server tidak punya Node.js):

Jalankan `npm install && npm run build` di komputer lokal, lalu upload folder
`public/build/` ke server.

#### 7. Selesai

Buka `https://domain-anda.com` dan login admin dengan email/password dari `.env`.

---

### C. cPanel

#### 1. Upload File

Upload seluruh isi repositori ke `public_html/` (atau subdomain folder) via
**File Manager** cPanel atau FTP.

#### 2. Atur Document Root

Jika menggunakan domain utama, arahkan document root ke `public_html/public`.
Untuk **addon domain** atau **subdomain**, atur document root melalui:

```
cPanel → Domains → Addon Domains (atau Subdomains)
```

Pastikan path mengarah ke `<root_project>/public`.

#### 3. Atur PHP

Buka **cPanel → Select PHP Version**:
- Pilih **PHP 8.2** atau **8.3**
- Centang ekstensi: `pdo_mysql`, `gd`, `curl`, `zip`, `fileinfo`, `openssl`
- Set `memory_limit` minimal 256M

#### 4. Buat Database

Buka **cPanel → MySQL Databases**:
1. Buat database (catat nama)
2. Buat user + password (catat)
3. **Add user to database** lalu centang **ALL PRIVILEGES**

#### 5. Konfigurasi `.env`

Salin `.env.example` ke `.env` dan isi:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpanelUser_namaDatabase
DB_USERNAME=cpanelUser_namaUser
DB_PASSWORD=password_database

WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=token_fonnte_anda
WA_TARGET_NUMBER=08xxxxxxxxxx

ADMIN_EMAIL=admin@domain-anda.com
ADMIN_PASSWORD=password_aman
```

> cPanel otomatis menambahkan prefix username ke nama database dan user.
> Gunakan nama lengkap seperti di atas.

#### 6. Jalankan Setup (via Terminal cPanel)

Buka **cPanel → Terminal** dan jalankan:

```bash
cd ~/public_html
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

#### 7. Build Frontend

Jika server tidak memiliki Node.js, build di lokal lalu upload folder
`public/build/`. Jika ada Node.js (≥ 20), jalankan `npm install && npm run build`
di root project via Terminal.

#### 8. Selesai

Buka domain di browser. Login admin dengan kredensial dari `ADMIN_EMAIL` /
`ADMIN_PASSWORD` di `.env`.

---

## Variabel Environment

| Key | Wajib | Keterangan |
| --- |:---:| --- |
| `APP_URL` | ✅ | URL lengkap domain (https://...) |
| `DB_CONNECTION` | ✅ | `sqlite` (dev) atau `mysql` (production) |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | ✅ | Kredensial database |
| `WA_GATEWAY_URL` | ✅ | Endpoint Fonnte (`https://api.fonnte.com/send`) |
| `WA_GATEWAY_TOKEN` | ✅ | Token API Fonnte |
| `WA_TARGET_NUMBER` | ✅ | Nomor WhatsApp tujuan notifikasi |
| `ADMIN_EMAIL` | — | Email admin (default: `admin@pancenjateng.id`) |
| `ADMIN_PASSWORD` | — | Password admin (default: `password`) |

---

## Testing

```bash
php artisan test                    # Unit & Feature tests
npx tsc --noEmit                    # TypeScript type check
npx eslint resources/js/            # Frontend lint
vendor/bin/pint --test              # PHP code style
composer audit                      # Dependency vulnerabilities
```

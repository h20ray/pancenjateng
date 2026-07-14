# Pancen Jateng — Implementation Plan

**Goal:** Build a complete whistleblower reporting system for illegal cigarettes in Central Java with a 4-step wizard form, WhatsApp notifications, Google Maps location picker, and admin dashboard.

**Architecture:** Laravel 12 REST API + Vue 3 SPA with two route groups (public `/lapor`, `/lacak` and admin `/admin/*`). shadcn-vue components, Pinia stores, Sanctum auth for admin. WhatsApp via Fonnte gateway HTTP POST.

**Tech Stack:** Laravel 12, PHP 8.4, MariaDB, Vue 3 (Composition API + `<script setup>`), TypeScript, Tailwind CSS 4, shadcn-vue (Radix Vue), Pinia 3, Vite 8, Google Maps JS API, Vitest 4, PHPUnit 11

---

## File Map

### Backend (Laravel)

| File | Action |
|---|---|
| `database/migrations/2026_07_14_000001_create_aduans_table.php` | Create |
| `app/Models/Aduan.php` | Create |
| `app/Http/Controllers/Api/AduanController.php` | Create |
| `app/Http/Controllers/Api/TrackController.php` | Create |
| `app/Http/Controllers/Api/UploadController.php` | Create |
| `app/Http/Controllers/Api/KabupatenKotaController.php` | Create |
| `app/Http/Controllers/Admin/AduanController.php` | Create |
| `app/Http/Controllers/Admin/DashboardController.php` | Create |
| `app/Http/Controllers/Admin/AuthController.php` | Create |
| `app/Http/Requests/AduanStoreRequest.php` | Create |
| `app/Http/Requests/AduanUpdateStatusRequest.php` | Create |
| `app/Http/Resources/AduanResource.php` | Create |
| `app/Http/Resources/AduanDetailResource.php` | Create |
| `app/Services/AduanService.php` | Create |
| `app/Services/WhatsappService.php` | Create |
| `app/Services/LocationService.php` | Create |
| `app/Services/DashboardService.php` | Create |
| `routes/api.php` | Modify |
| `tests/Feature/AduanApiTest.php` | Create |
| `tests/Feature/AdminAduanApiTest.php` | Create |

### Frontend (Vue)

| File | Action |
|---|---|
| `resources/js/router/index.ts` | Create |
| `resources/js/stores/wizardStore.ts` | Create |
| `resources/js/stores/authStore.ts` | Create |
| `resources/js/pages/WizardFormPage.vue` | Create |
| `resources/js/pages/SuccessPage.vue` | Create |
| `resources/js/pages/TrackingPage.vue` | Create |
| `resources/js/pages/admin/AdminLoginPage.vue` | Create |
| `resources/js/pages/admin/AdminDashboardPage.vue` | Create |
| `resources/js/pages/admin/AdminAduanListPage.vue` | Create |
| `resources/js/pages/admin/AdminAduanDetailPage.vue` | Create |
| `resources/js/components/wizard/WizardContainer.vue` | Create |
| `resources/js/components/wizard/WizardStepIndicator.vue` | Create |
| `resources/js/components/wizard/Step1Identitas.vue` | Create |
| `resources/js/components/wizard/Step2Lokasi.vue` | Create |
| `resources/js/components/wizard/Step3Detail.vue` | Create |
| `resources/js/components/wizard/Step4Konfirmasi.vue` | Create |
| `resources/js/components/MapPicker.vue` | Create |
| `resources/js/components/admin/AdminLayout.vue` | Create |
| `resources/js/components/admin/StatsCards.vue` | Create |
| `resources/js/components/admin/StatusPieChart.vue` | Create |
| `resources/js/components/admin/AduanTable.vue` | Create |
| `resources/js/services/googleMapsLoader.ts` | Create |
| `resources/js/services/api.ts` | Create |
| `resources/js/composables/useGeolocation.ts` | Create |
| `resources/js/config/env.ts` | Create |
| `resources/js/app.ts` | Create |

---

## Phase 1: Scaffold Laravel Project

### Task 1.1: Create Laravel project

**Files:**
- Create: Laravel project in `c:\GitHub\pancenjateng`

- [ ] **Step 1: Create project**

```bash
composer create-project laravel/laravel:^12.0 .
```

- [ ] **Step 2: Verify**

Run: `php artisan --version`
Expected: Laravel Framework 12.x.x

- [ ] **Step 3: Configure .env**

Set database to MariaDB:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pancenjateng
DB_USERNAME=root
DB_PASSWORD=
```

Run: `php artisan migrate`
Expected: Default migrations run successfully.

- [ ] **Step 4: Install Sanctum**

```bash
php artisan install:api
```

- [ ] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Laravel 12 project with Sanctum"
```

---

## Phase 2: Frontend Scaffold (Vue + Tailwind + shadcn)

### Task 2.1: Install Node dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vue + Vite + Tailwind + shadcn-vue deps**

```bash
npm install vue@^3.5 vue-router@^4 pinia@^3 axios@^1
npm install -D @vitejs/plugin-vue vite@^8 laravel-vite-plugin tailwindcss@^4 @tailwindcss/vite typescript vue-tsc
```

- [ ] **Step 2: Install shadcn-vue**

```bash
npx shadcn-vue@latest init
# Choose: TypeScript, Tailwind 4, CSS variables, zinc neutral
```

- [ ] **Step 3: Add shadcn components needed**

```bash
npx shadcn-vue@latest add button input label card textarea select radio-group checkbox toast tabs badge dialog dropdown-menu table
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vue 3 + Tailwind 4 + shadcn-vue frontend"
```

### Task 2.2: Configure Vite + TypeScript + Router + Pinia

**Files:**
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `resources/js/app.ts`
- Create: `resources/js/router/index.ts`
- Create: `resources/js/config/env.ts`

- [ ] **Step 1: vite.config.ts (minimal — Laravel + Vue)**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            refresh: true,
        }),
        vue(),
        tailwindcss(),
    ],
});
```

- [ ] **Step 2: tsconfig.json**

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "preserve",
        "paths": { "@/*": ["./resources/js/*"] },
        "baseUrl": ".",
        "types": ["vite/client"]
    },
    "include": ["resources/js/**/*.ts", "resources/js/**/*.vue"]
}
```

- [ ] **Step 3: resources/js/app.ts**

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

- [ ] **Step 4: resources/js/router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', redirect: '/lapor' },
    { path: '/lapor', component: () => import('@/pages/WizardFormPage.vue') },
    { path: '/lapor/berhasil/:ticket', component: () => import('@/pages/SuccessPage.vue') },
    { path: '/lacak', component: () => import('@/pages/TrackingPage.vue') },
    { path: '/admin/login', component: () => import('@/pages/admin/AdminLoginPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/AdminDashboardPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin/aduan', component: () => import('@/pages/admin/AdminAduanListPage.vue'), meta: { requiresAuth: true } },
    { path: '/admin/aduan/:id', component: () => import('@/pages/admin/AdminAduanDetailPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
```

- [ ] **Step 5: resources/js/services/api.ts**

```typescript
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export default api;
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: configure Vite, TypeScript, Vue Router, Pinia"
```

---

## Phase 3: Database & Model

### Task 3.1: Create aduans migration

**Files:**
- Create: `database/migrations/2026_07_14_000001_create_aduans_table.php`

- [ ] **Step 1: Write migration**

```bash
php artisan make:migration create_aduans_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aduans', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->string('nama_pelapor', 100);
            $table->string('email', 100)->nullable();
            $table->string('nomor_wa', 20);
            $table->enum('jenis_rokok', ['sigaret_mesin', 'sigaret_tangan', 'tembakau_iris', 'cerutu', 'lainnya']);
            $table->string('kabupaten_kota', 50);
            $table->text('lokasi_kejadian');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('location_source', ['gps', 'ip', 'manual'])->default('manual');
            $table->string('nama_toko', 150);
            $table->string('merk_rokok', 150);
            $table->text('detail_aduan');
            $table->string('foto_bukti', 255)->nullable();
            $table->enum('status', ['baru', 'diproses', 'selesai', 'ditolak'])->default('baru');
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->string('whatsapp_status', 50)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['ticket_number', 'nomor_wa']);
            $table->index('status');
            $table->index('kabupaten_kota');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aduans');
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate`
Expected: Migration runs, table created.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: create aduans table migration"
```

### Task 3.2: Create Aduan model

**Files:**
- Create: `app/Models/Aduan.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aduan extends Model
{
    use SoftDeletes;

    protected $table = 'aduans';

    protected $fillable = [
        'ticket_number',
        'nama_pelapor',
        'email',
        'nomor_wa',
        'jenis_rokok',
        'kabupaten_kota',
        'lokasi_kejadian',
        'latitude',
        'longitude',
        'location_source',
        'nama_toko',
        'merk_rokok',
        'detail_aduan',
        'foto_bukti',
        'status',
        'whatsapp_sent_at',
        'whatsapp_status',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'whatsapp_sent_at' => 'datetime',
    ];
}
```

- [ ] **Step 1: Commit**

```bash
git add -A && git commit -m "feat: create Aduan model"
```

---

## Phase 4: Backend — Public API

### Task 4.1: AduanStoreRequest validation

**Files:**
- Create: `app/Http/Requests/AduanStoreRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AduanStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nama_pelapor' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['nullable', 'email', 'max:100'],
            'nomor_wa' => ['required', 'string', 'regex:/^(08|62)\d{8,12}$/'],
            'jenis_rokok' => ['required', 'in:sigaret_mesin,sigaret_tangan,tembakau_iris,cerutu,lainnya'],
            'kabupaten_kota' => ['required', 'string', 'max:50'],
            'lokasi_kejadian' => ['required', 'string', 'min:10'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_source' => ['nullable', 'in:gps,ip,manual'],
            'nama_toko' => ['required', 'string', 'min:3', 'max:150'],
            'merk_rokok' => ['required', 'string', 'min:2', 'max:150'],
            'detail_aduan' => ['required', 'string', 'min:20'],
            'foto_bukti' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nomor_wa.regex' => 'Nomor WA harus dimulai dengan 08 atau 62.',
            'detail_aduan.min' => 'Detail aduan minimal 20 karakter.',
            'lokasi_kejadian.min' => 'Lokasi kejadian minimal 10 karakter.',
        ];
    }
}
```

- [ ] **Step 1: Commit**

```bash
git add -A && git commit -m "feat: create AduanStoreRequest validation"
```

### Task 4.2: AduanService (store + ticket generation)

**Files:**
- Create: `app/Services/AduanService.php`

```php
<?php

namespace App\Services;

use App\Http\Requests\AduanStoreRequest;
use App\Models\Aduan;
use Carbon\Carbon;

class AduanService
{
    public function store(AduanStoreRequest $request): Aduan
    {
        return Aduan::create([
            ...$request->validated(),
            'ticket_number' => $this->generateTicketNumber(),
            'status' => 'baru',
        ]);
    }

    public function generateTicketNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $last = Aduan::whereDate('created_at', today())
            ->orderByDesc('id')
            ->first();

        $next = $last ? (int) substr($last->ticket_number, -4) + 1 : 1;

        return sprintf('ADN-%s-%04d', $date, $next);
    }

    public function findDuplicate(string $nomorWa, string $namaToko): bool
    {
        return Aduan::where('nomor_wa', $nomorWa)
            ->where('nama_toko', $namaToko)
            ->where('created_at', '>=', Carbon::now()->subMinutes(5))
            ->exists();
    }
}
```

- [ ] **Step 1: Commit**

```bash
git add -A && git commit -m "feat: create AduanService with ticket generation and duplicate check"
```

### Task 4.3: AduanController (public POST + upload + track)

**Files:**
- Create: `app/Http/Controllers/Api/AduanController.php`
- Create: `app/Http/Controllers/Api/TrackController.php`
- Create: `app/Http/Controllers/Api/UploadController.php`
- Create: `app/Http/Resources/AduanResource.php`
- Modify: `routes/api.php`

- [ ] **Step 1: AduanController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AduanStoreRequest;
use App\Http\Resources\AduanResource;
use App\Services\AduanService;
use App\Services\WhatsappService;
use Illuminate\Http\JsonResponse;

class AduanController extends Controller
{
    public function __construct(
        private AduanService $aduanService,
        private WhatsappService $whatsappService,
    ) {}

    public function store(AduanStoreRequest $request): JsonResponse
    {
        if ($this->aduanService->findDuplicate($request->nomor_wa, $request->nama_toko)) {
            return response()->json([
                'message' => 'Laporan serupa sudah dikirim dalam 5 menit terakhir.',
            ], 409);
        }

        $aduan = $this->aduanService->store($request);

        // Fire-and-forget WhatsApp
        $this->whatsappService->sendRecap($aduan);

        return (new AduanResource($aduan))
            ->response()
            ->setStatusCode(201);
    }
}
```

- [ ] **Step 2: AduanResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AduanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'ticket_number' => $this->ticket_number,
            'status' => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
```

- [ ] **Step 3: TrackController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'ticket' => ['required', 'string'],
            'phone' => ['required', 'string'],
        ]);

        $aduan = Aduan::where('ticket_number', $request->ticket)
            ->where('nomor_wa', $request->phone)
            ->first();

        if (!$aduan) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        return response()->json([
            'ticket_number' => $aduan->ticket_number,
            'status' => $aduan->status,
            'kabupaten_kota' => $aduan->kabupaten_kota,
            'jenis_rokok' => $aduan->jenis_rokok,
            'created_at' => $aduan->created_at->toIso8601String(),
            'updated_at' => $aduan->updated_at->toIso8601String(),
        ]);
    }
}
```

- [ ] **Step 4: UploadController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $path = $request->file('foto')->store('temp', 'public');

        return response()->json(['path' => $path], 201);
    }
}
```

- [ ] **Step 5: Register routes in routes/api.php**

```php
Route::post('/aduan', [\App\Http\Controllers\Api\AduanController::class, 'store']);
Route::get('/aduan/track', [\App\Http\Controllers\Api\TrackController::class, 'track']);
Route::post('/aduan/upload', [\App\Http\Controllers\Api\UploadController::class, 'upload']);
Route::get('/kabupaten-kota', [\App\Http\Controllers\Api\KabupatenKotaController::class, 'index']);
```

- [ ] **Step 6: Write feature test**

**Files:** `tests/Feature/AduanApiTest.php`

```php
<?php

use App\Models\Aduan;
use Illuminate\Http\UploadedFile;

test('can submit a valid aduan', function () {
    $response = $this->postJson('/api/aduan', [
        'nama_pelapor' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'nomor_wa' => '6281234567890',
        'jenis_rokok' => 'sigaret_mesin',
        'kabupaten_kota' => 'Semarang',
        'lokasi_kejadian' => 'Jl. Pemuda No. 123, Kelurahan Sekayu',
        'latitude' => -7.005,
        'longitude' => 110.435,
        'location_source' => 'gps',
        'nama_toko' => 'Toko Makmur',
        'merk_rokok' => 'Gudang Garam',
        'detail_aduan' => 'Menjual rokok tanpa pita cukai dengan harga murah.',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['ticket_number', 'status', 'created_at']);
});

test('validation fails with invalid data', function () {
    $response = $this->postJson('/api/aduan', [
        'nama_pelapor' => 'A',
        'nomor_wa' => '123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['nama_pelapor', 'nomor_wa', 'jenis_rokok', 'kabupaten_kota', 'lokasi_kejadian', 'nama_toko', 'merk_rokok', 'detail_aduan']);
});

test('duplicate submission within 5 minutes returns 409', function () {
    Aduan::create([
        'ticket_number' => 'ADN-20260714-0001',
        'nama_pelapor' => 'Budi',
        'nomor_wa' => '6281234567890',
        'jenis_rokok' => 'sigaret_mesin',
        'kabupaten_kota' => 'Semarang',
        'lokasi_kejadian' => 'Jl. Pemuda No. 123',
        'nama_toko' => 'Toko Makmur',
        'merk_rokok' => 'Gudang Garam',
        'detail_aduan' => 'Menjual rokok tanpa pita cukai.',
    ]);

    $response = $this->postJson('/api/aduan', [
        'nama_pelapor' => 'Budi Santoso',
        'nomor_wa' => '6281234567890',
        'jenis_rokok' => 'sigaret_mesin',
        'kabupaten_kota' => 'Semarang',
        'lokasi_kejadian' => 'Jl. Pemuda No. 123',
        'nama_toko' => 'Toko Makmur',
        'merk_rokok' => 'Gudang Garam',
        'detail_aduan' => 'Menjual rokok tanpa pita cukai dengan harga murah.',
    ]);

    $response->assertStatus(409);
});

test('can track aduan by ticket and phone', function () {
    $aduan = Aduan::create([
        'ticket_number' => 'ADN-20260714-0002',
        'nama_pelapor' => 'Ani',
        'nomor_wa' => '6289876543210',
        'jenis_rokok' => 'sigaret_tangan',
        'kabupaten_kota' => 'Solo',
        'lokasi_kejadian' => 'Pasar Gede, Solo',
        'nama_toko' => 'Toko Murah',
        'merk_rokok' => 'Djarum',
        'detail_aduan' => 'Rokok tanpa cukai dijual bebas.',
    ]);

    $response = $this->getJson('/api/aduan/track?ticket=ADN-20260714-0002&phone=6289876543210');

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => 'baru']);
});

test('track returns 404 for wrong credentials', function () {
    $response = $this->getJson('/api/aduan/track?ticket=WRONG&phone=000');

    $response->assertStatus(404);
});
```

- [ ] **Step 7: Run tests**

Run: `php artisan test --filter=AduanApiTest`
Expected: 4 tests should PASS. The "can submit a valid aduan" test may FAIL if WhatsApp service is not yet implemented (mock needed).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: public API - submit, track, upload + validation tests"
```

---

## Phase 5: WhatsApp Integration

### Task 5.1: WhatsappService

**Files:**
- Create: `app/Services/WhatsappService.php`

```php
<?php

namespace App\Services;

use App\Models\Aduan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    public function sendRecap(Aduan $aduan): void
    {
        $url = config('services.whatsapp.url');
        $token = config('services.whatsapp.token');
        $target = config('services.whatsapp.target');

        if (!$url || !$token) {
            Log::warning('WhatsApp gateway not configured');
            $aduan->update(['whatsapp_status' => 'pending']);
            return;
        }

        $message = $this->buildRecapMessage($aduan);

        try {
            $response = Http::withToken($token)
                ->post($url, [
                    'target' => $target,
                    'message' => $message,
                ]);

            $aduan->update([
                'whatsapp_sent_at' => now(),
                'whatsapp_status' => $response->successful() ? 'sent' : 'failed',
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp send failed: ' . $e->getMessage());
            $aduan->update(['whatsapp_status' => 'failed']);
        }
    }

    private function buildRecapMessage(Aduan $aduan): string
    {
        $maps = $aduan->latitude && $aduan->longitude
            ? "https://maps.google.com/?q={$aduan->latitude},{$aduan->longitude}"
            : '(tidak tersedia)';

        $foto = $aduan->foto_bukti ? '📸 Ada foto bukti' : '📸 Tanpa foto';

        return "📢 *ADUAN BARU - Pancen Jateng*\n"
            . "🎫 Tiket: {$aduan->ticket_number}\n"
            . "📅 " . $aduan->created_at->format('d F Y, H:i') . " WIB\n\n"
            . "👤 *Pelapor*\n"
            . "Nama: {$aduan->nama_pelapor}\n"
            . "WA: {$aduan->nomor_wa}\n\n"
            . "📍 *Lokasi*\n"
            . "Kab/Kota: {$aduan->kabupaten_kota}\n"
            . "Alamat: {$aduan->lokasi_kejadian}\n"
            . "Toko: {$aduan->nama_toko}\n"
            . "🗺 {$maps}\n\n"
            . "🚬 *Rokok*\n"
            . "Jenis: {$aduan->jenis_rokok}\n"
            . "Merk: {$aduan->merk_rokok}\n\n"
            . "📝 *Detail*\n"
            . "{$aduan->detail_aduan}\n\n"
            . "{$foto}\n"
            . "🔍 Lacak: https://pancenjateng.id/lacak?tiket={$aduan->ticket_number}";
    }
}
```

- [ ] **Step 2: Add config in config/services.php**

```php
'whatsapp' => [
    'url' => env('WA_GATEWAY_URL'),
    'token' => env('WA_GATEWAY_TOKEN'),
    'target' => env('WA_TARGET_NUMBER'),
],
```

- [ ] **Step 3: Mock in test, verify**

Update test to mock HTTP:

```php
use Illuminate\Support\Facades\Http;

test('can submit a valid aduan and sends whatsapp', function () {
    Http::fake([
        '*' => Http::response(['status' => true], 200),
    ]);

    $response = $this->postJson('/api/aduan', [...]);
    $response->assertStatus(201);
});
```

Run: `php artisan test --filter=AduanApiTest`
Expected: 4 PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: WhatsApp recap notification on aduan submit"
```

---

## Phase 6: Backend — Admin API

### Task 6.1: Admin Auth + Dashboard + CRUD

**Files:**
- Create: `app/Http/Controllers/Admin/AuthController.php`
- Create: `app/Http/Controllers/Admin/AduanController.php`
- Create: `app/Http/Controllers/Admin/DashboardController.php`
- Create: `app/Services/DashboardService.php`
- Create: `app/Http/Resources/AduanDetailResource.php`
- Modify: `routes/api.php`

- [ ] **Step 1: AuthController**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        $token = $user->createToken('admin')->plainTextToken;

        return response()->json(['token' => $token, 'user' => ['name' => $user->name, 'email' => $user->email]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
```

- [ ] **Step 2: Admin AduanController**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AduanUpdateStatusRequest;
use App\Http\Resources\AduanDetailResource;
use App\Models\Aduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AduanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Aduan::query();

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->kabupaten) {
            $query->where('kabupaten_kota', $request->kabupaten);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', "%{$request->search}%")
                  ->orWhere('nama_pelapor', 'like', "%{$request->search}%");
            });
        }
        if ($request->jenis_rokok) {
            $query->where('jenis_rokok', $request->jenis_rokok);
        }

        $aduans = $query->orderByDesc('created_at')->paginate($request->per_page ?? 15);

        return response()->json($aduans);
    }

    public function show(Aduan $aduan): JsonResponse
    {
        return response()->json(new AduanDetailResource($aduan));
    }

    public function updateStatus(AduanUpdateStatusRequest $request, Aduan $aduan): JsonResponse
    {
        $aduan->update($request->validated());
        return response()->json(new AduanDetailResource($aduan));
    }

    public function destroy(Aduan $aduan): JsonResponse
    {
        $aduan->delete();
        return response()->json(['message' => 'Aduan dihapus.']);
    }
}
```

- [ ] **Step 3: AduanDetailResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AduanDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'nama_pelapor' => $this->nama_pelapor,
            'email' => $this->email,
            'nomor_wa' => $this->nomor_wa,
            'jenis_rokok' => $this->jenis_rokok,
            'kabupaten_kota' => $this->kabupaten_kota,
            'lokasi_kejadian' => $this->lokasi_kejadian,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_source' => $this->location_source,
            'nama_toko' => $this->nama_toko,
            'merk_rokok' => $this->merk_rokok,
            'detail_aduan' => $this->detail_aduan,
            'foto_bukti' => $this->foto_bukti ? asset('storage/' . $this->foto_bukti) : null,
            'status' => $this->status,
            'whatsapp_sent_at' => $this->whatsapp_sent_at,
            'whatsapp_status' => $this->whatsapp_status,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

- [ ] **Step 4: DashboardController + DashboardService**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function index(): JsonResponse
    {
        return response()->json($this->dashboardService->stats());
    }
}
```

```php
<?php

namespace App\Services;

use App\Models\Aduan;
use Carbon\Carbon;

class DashboardService
{
    public function stats(): array
    {
        return [
            'total' => Aduan::count(),
            'hari_ini' => Aduan::whereDate('created_at', today())->count(),
            'minggu_ini' => Aduan::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'bulan_ini' => Aduan::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'per_status' => Aduan::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'per_kabupaten' => Aduan::selectRaw('kabupaten_kota, count(*) as total')
                ->groupBy('kabupaten_kota')
                ->orderByDesc('total')
                ->limit(15)
                ->pluck('total', 'kabupaten_kota'),
            'terbaru' => Aduan::orderByDesc('created_at')->limit(10)->get(),
        ];
    }
}
```

- [ ] **Step 5: Register admin routes**

```php
// routes/api.php — add:

Route::post('/admin/login', [\App\Http\Controllers\Admin\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Admin\AuthController::class, 'logout']);
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
    Route::get('/aduan', [\App\Http\Controllers\Admin\AduanController::class, 'index']);
    Route::get('/aduan/{aduan}', [\App\Http\Controllers\Admin\AduanController::class, 'show']);
    Route::patch('/aduan/{aduan}', [\App\Http\Controllers\Admin\AduanController::class, 'updateStatus']);
    Route::delete('/aduan/{aduan}', [\App\Http\Controllers\Admin\AduanController::class, 'destroy']);
});
```

- [ ] **Step 6: Write admin API test**

**Files:** `tests/Feature/AdminAduanApiTest.php`

```php
<?php

use App\Models\Aduan;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('admin can login', function () {
    $response = $this->postJson('/api/admin/login', [
        'email' => $this->user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
});

test('unauthenticated cannot access admin routes', function () {
    $response = $this->getJson('/api/admin/dashboard');
    $response->assertStatus(401);
});

test('admin can list aduans', function () {
    Aduan::factory()->count(3)->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/admin/aduan');

    $response->assertStatus(200);
});

test('admin can update aduan status', function () {
    $aduan = Aduan::factory()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->patchJson("/api/admin/aduan/{$aduan->id}", ['status' => 'diproses']);

    $response->assertStatus(200);
    expect($aduan->fresh()->status)->toBe('diproses');
});

test('admin can soft delete aduan', function () {
    $aduan = Aduan::factory()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->deleteJson("/api/admin/aduan/{$aduan->id}");

    $response->assertStatus(200);
    $this->assertSoftDeleted($aduan);
});
```

- [ ] **Step 7: Run tests**

Run: `php artisan test --filter=AdminAduanApiTest`
Expected: 5 PASS.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: admin API - auth, dashboard, CRUD aduan"
```

---

## Phase 7: Frontend — Public Pages

### Task 7.1: Wizard Store (Pinia)

**Files:**
- Create: `resources/js/stores/wizardStore.ts`

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AduanForm {
    nama_pelapor: string;
    email: string;
    nomor_wa: string;
    jenis_rokok: string;
    kabupaten_kota: string;
    lokasi_kejadian: string;
    latitude: number | null;
    longitude: number | null;
    location_source: 'gps' | 'ip' | 'manual';
    nama_toko: string;
    merk_rokok: string;
    detail_aduan: string;
    foto_bukti: string | null;
}

const initialForm: AduanForm = {
    nama_pelapor: '',
    email: '',
    nomor_wa: '',
    jenis_rokok: '',
    kabupaten_kota: '',
    lokasi_kejadian: '',
    latitude: null,
    longitude: null,
    location_source: 'manual',
    nama_toko: '',
    merk_rokok: '',
    detail_aduan: '',
    foto_bukti: null,
};

export const useWizardStore = defineStore('wizard', () => {
    const currentStep = ref(1);
    const form = ref<AduanForm>({ ...initialForm });
    const isSubmitting = ref(false);

    const totalSteps = 4;

    function nextStep() {
        if (currentStep.value < totalSteps) currentStep.value++;
    }

    function prevStep() {
        if (currentStep.value > 1) currentStep.value--;
    }

    function resetForm() {
        form.value = { ...initialForm };
        currentStep.value = 1;
    }

    const canProceedStep1 = computed(() =>
        form.value.nama_pelapor.length >= 3
        && /^(08|62)\d{8,12}$/.test(form.value.nomor_wa.replace(/\D/g, ''))
    );

    const canProceedStep2 = computed(() =>
        form.value.kabupaten_kota !== ''
        && form.value.lokasi_kejadian.length >= 10
        && form.value.nama_toko.length >= 3
    );

    const canProceedStep3 = computed(() =>
        form.value.jenis_rokok !== ''
        && form.value.merk_rokok.length >= 2
        && form.value.detail_aduan.length >= 20
    );

    return {
        currentStep, form, isSubmitting, totalSteps,
        nextStep, prevStep, resetForm,
        canProceedStep1, canProceedStep2, canProceedStep3,
    };
});
```

- [ ] **Step 1: Commit (with store)**

```bash
git add -A && git commit -m "feat: Pinia wizard store with step validation"
```

### Task 7.2: Wizard Components (Step 1–4 + Container)

**Files:**
- Create: `resources/js/components/wizard/WizardContainer.vue`
- Create: `resources/js/components/wizard/WizardStepIndicator.vue`
- Create: `resources/js/components/wizard/Step1Identitas.vue`
- Create: `resources/js/components/wizard/Step2Lokasi.vue`
- Create: `resources/js/components/wizard/Step3Detail.vue`
- Create: `resources/js/components/wizard/Step4Konfirmasi.vue`
- Create: `resources/js/pages/WizardFormPage.vue`
- Create: `resources/js/pages/SuccessPage.vue`

- [ ] **Step 1: WizardContainer.vue**

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import WizardStepIndicator from './WizardStepIndicator.vue';
import Step1Identitas from './Step1Identitas.vue';
import Step2Lokasi from './Step2Lokasi.vue';
import Step3Detail from './Step3Detail.vue';
import Step4Konfirmasi from './Step4Konfirmasi.vue';

const wizard = useWizardStore();
</script>

<template>
    <div class="max-w-2xl mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold text-center mb-2">Lapor Rokok Ilegal</h1>
        <p class="text-muted-foreground text-center mb-8">Laporkan peredaran rokok ilegal di wilayah Anda</p>

        <WizardStepIndicator />

        <div class="mt-8">
            <Step1Identitas v-if="wizard.currentStep === 1" />
            <Step2Lokasi v-else-if="wizard.currentStep === 2" />
            <Step3Detail v-else-if="wizard.currentStep === 3" />
            <Step4Konfirmasi v-else-if="wizard.currentStep === 4" />
        </div>
    </div>
</template>
```

- [ ] **Step 2: WizardStepIndicator.vue**

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';

const wizard = useWizardStore();
const steps = ['Identitas', 'Lokasi', 'Detail', 'Konfirmasi'];
</script>

<template>
    <div class="flex items-center justify-center gap-2">
        <template v-for="(label, i) in steps" :key="i">
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="{
                        'bg-primary text-primary-foreground': wizard.currentStep > i,
                        'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2': wizard.currentStep === i + 1,
                        'bg-muted text-muted-foreground': wizard.currentStep < i + 1,
                    }"
                >
                    {{ wizard.currentStep > i ? '✓' : i + 1 }}
                </div>
                <span
                    class="text-sm hidden sm:inline"
                    :class="{ 'text-muted-foreground': wizard.currentStep !== i + 1 }"
                >
                    {{ label }}
                </span>
            </div>
            <div v-if="i < steps.length - 1" class="w-8 h-px bg-border" />
        </template>
    </div>
</template>
```

- [ ] **Step 3: Step1Identitas.vue**

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const wizard = useWizardStore();
</script>

<template>
    <div class="space-y-6">
        <div>
            <h2 class="text-lg font-semibold mb-4">Identitas Pelapor</h2>
            <p class="text-sm text-muted-foreground mb-6">Data Anda dirahasiakan dan hanya digunakan untuk verifikasi laporan.</p>
        </div>

        <div class="space-y-2">
            <Label for="nama">Nama Pelapor *</Label>
            <Input id="nama" v-model="wizard.form.nama_pelapor" placeholder="Nama lengkap Anda" />
        </div>

        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="wizard.form.email" type="email" placeholder="email@example.com (opsional)" />
        </div>

        <div class="space-y-2">
            <Label for="wa">Nomor WhatsApp *</Label>
            <Input id="wa" v-model="wizard.form.nomor_wa" placeholder="0812xxxxxxxx" />
            <p class="text-xs text-muted-foreground">Format: 08xx atau 62xx</p>
        </div>

        <div class="flex justify-end pt-4">
            <Button :disabled="!wizard.canProceedStep1" @click="wizard.nextStep()">
                Lanjut ke Lokasi →
            </Button>
        </div>
    </div>
</template>
```

- [ ] **Step 4: Step2Lokasi.vue** (with MapPicker)

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapPicker from '@/components/MapPicker.vue';

const wizard = useWizardStore();

const kabupatenKota = [
    'Banjarnegara', 'Banyumas', 'Batang', 'Blora', 'Boyolali', 'Brebes',
    'Cilacap', 'Demak', 'Grobogan', 'Jepara', 'Karanganyar', 'Kebumen',
    'Kendal', 'Klaten', 'Kudus', 'Magelang', 'Pati', 'Pekalongan',
    'Pemalang', 'Purbalingga', 'Purworejo', 'Rembang', 'Semarang',
    'Sragen', 'Sukoharjo', 'Tegal', 'Temanggung', 'Wonogiri', 'Wonosobo',
    'Kota Magelang', 'Kota Pekalongan', 'Kota Salatiga', 'Kota Semarang',
    'Kota Surakarta', 'Kota Tegal',
];

function onMapUpdate(lat: number, lng: number, source: 'gps' | 'ip' | 'manual') {
    wizard.form.latitude = lat;
    wizard.form.longitude = lng;
    wizard.form.location_source = source;
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Lokasi Kejadian</h2>

        <div class="space-y-2">
            <Label>Kabupaten/Kota *</Label>
            <Select v-model="wizard.form.kabupaten_kota">
                <SelectTrigger>
                    <SelectValue placeholder="Pilih kabupaten/kota" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="kota in kabupatenKota" :key="kota" :value="kota">
                        {{ kota }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="space-y-2">
            <Label>Pilih Lokasi di Peta</Label>
            <MapPicker @update="onMapUpdate" />
        </div>

        <div class="space-y-2">
            <Label for="alamat">Alamat Lengkap *</Label>
            <Input id="alamat" v-model="wizard.form.lokasi_kejadian" placeholder="Jl. ..., RT/RW, Kelurahan, Kecamatan" />
        </div>

        <div class="space-y-2">
            <Label for="toko">Nama Toko/Warung *</Label>
            <Input id="toko" v-model="wizard.form.nama_toko" placeholder="Nama toko atau warung" />
        </div>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← Kembali</Button>
            <Button :disabled="!wizard.canProceedStep2" @click="wizard.nextStep()">
                Lanjut ke Detail →
            </Button>
        </div>
    </div>
</template>
```

- [ ] **Step 5: Step3Detail.vue**

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ref } from 'vue';
import api from '@/services/api';

const wizard = useWizardStore();
const uploading = ref(false);
const uploadError = ref('');

const jenisRokokOptions = [
    { value: 'sigaret_mesin', label: 'Sigaret Mesin (SKM/SPM)' },
    { value: 'sigaret_tangan', label: 'Sigaret Tangan (SKT)' },
    { value: 'tembakau_iris', label: 'Tembakau Iris' },
    { value: 'cerutu', label: 'Cerutu' },
    { value: 'lainnya', label: 'Lainnya' },
];

async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = 'Ukuran file maksimal 2MB.';
        return;
    }

    uploading.value = true;
    uploadError.value = '';

    const formData = new FormData();
    formData.append('foto', file);

    try {
        const { data } = await api.post('/aduan/upload', formData);
        wizard.form.foto_bukti = data.path;
    } catch {
        uploadError.value = 'Gagal mengupload foto. Coba lagi.';
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Detail Aduan</h2>

        <div class="space-y-3">
            <Label>Jenis Rokok Ilegal *</Label>
            <RadioGroup v-model="wizard.form.jenis_rokok">
                <div v-for="opt in jenisRokokOptions" :key="opt.value" class="flex items-center gap-2">
                    <RadioGroupItem :id="opt.value" :value="opt.value" />
                    <Label :for="opt.value" class="font-normal">{{ opt.label }}</Label>
                </div>
            </RadioGroup>
        </div>

        <div class="space-y-2">
            <Label for="merk">Merk Rokok *</Label>
            <Input id="merk" v-model="wizard.form.merk_rokok" placeholder="Contoh: Gudang Garam, Djarum, dll." />
        </div>

        <div class="space-y-2">
            <Label for="detail">Detail Aduan *</Label>
            <Textarea id="detail" v-model="wizard.form.detail_aduan" placeholder="Ceritakan kronologi dan detail pelanggaran..." rows="4" />
            <p class="text-xs text-muted-foreground">{{ wizard.form.detail_aduan.length }}/20 karakter minimum</p>
        </div>

        <div class="space-y-2">
            <Label>Foto Bukti (opsional)</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onFileChange" />
            <p v-if="uploading" class="text-sm text-muted-foreground">Mengupload...</p>
            <p v-if="uploadError" class="text-sm text-destructive">{{ uploadError }}</p>
            <p v-if="wizard.form.foto_bukti" class="text-sm text-green-600">✓ Foto terupload</p>
        </div>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← Kembali</Button>
            <Button :disabled="!wizard.canProceedStep3" @click="wizard.nextStep()">
                Review Laporan →
            </Button>
        </div>
    </div>
</template>
```

- [ ] **Step 6: Step4Konfirmasi.vue**

```vue
<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/services/api';

const wizard = useWizardStore();
const router = useRouter();
const agreed = ref(false);
const error = ref('');

const jenisLabel: Record<string, string> = {
    sigaret_mesin: 'Sigaret Mesin',
    sigaret_tangan: 'Sigaret Tangan',
    tembakau_iris: 'Tembakau Iris',
    cerutu: 'Cerutu',
    lainnya: 'Lainnya',
};

async function submit() {
    if (!agreed.value) return;

    wizard.isSubmitting = true;
    error.value = '';

    try {
        const { data } = await api.post('/aduan', {
            ...wizard.form,
            nomor_wa: wizard.form.nomor_wa.replace(/\D/g, ''),
        });

        wizard.resetForm();
        router.push(`/lapor/berhasil/${data.ticket_number}`);
    } catch (e: any) {
        if (e.response?.status === 409) {
            error.value = 'Laporan serupa sudah dikirim dalam 5 menit terakhir.';
        } else if (e.response?.status === 422) {
            error.value = 'Data tidak valid. Silakan periksa kembali.';
        } else {
            error.value = 'Gagal mengirim laporan. Silakan coba lagi.';
        }
    } finally {
        wizard.isSubmitting = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Konfirmasi Laporan</h2>
        <p class="text-sm text-muted-foreground">Periksa kembali data Anda sebelum dikirim.</p>

        <div class="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div><strong>Nama:</strong> {{ wizard.form.nama_pelapor }}</div>
            <div v-if="wizard.form.email"><strong>Email:</strong> {{ wizard.form.email }}</div>
            <div><strong>WA:</strong> {{ wizard.form.nomor_wa }}</div>
            <hr class="my-2">
            <div><strong>Kab/Kota:</strong> {{ wizard.form.kabupaten_kota }}</div>
            <div><strong>Alamat:</strong> {{ wizard.form.lokasi_kejadian }}</div>
            <div><strong>Toko:</strong> {{ wizard.form.nama_toko }}</div>
            <hr class="my-2">
            <div><strong>Jenis:</strong> {{ jenisLabel[wizard.form.jenis_rokok] }}</div>
            <div><strong>Merk:</strong> {{ wizard.form.merk_rokok }}</div>
            <div><strong>Detail:</strong> {{ wizard.form.detail_aduan }}</div>
            <div v-if="wizard.form.foto_bukti"><strong>Foto:</strong> Terlampir</div>
        </div>

        <div class="flex items-start gap-2">
            <Checkbox id="agree" v-model:checked="agreed" />
            <Label for="agree" class="text-sm leading-5">
                Saya menyatakan bahwa laporan ini benar dan dapat dipertanggungjawabkan.
            </Label>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← Kembali</Button>
            <Button :disabled="!agreed || wizard.isSubmitting" @click="submit">
                {{ wizard.isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </Button>
        </div>
    </div>
</template>
```

- [ ] **Step 7: WizardFormPage.vue**

```vue
<script setup lang="ts">
import WizardContainer from '@/components/wizard/WizardContainer.vue';
</script>

<template>
    <WizardContainer />
</template>
```

- [ ] **Step 8: SuccessPage.vue**

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();
const ticket = route.params.ticket as string;
</script>

<template>
    <div class="max-w-lg mx-auto py-16 px-4 text-center">
        <div class="text-4xl mb-4">✅</div>
        <h1 class="text-2xl font-bold mb-2">Laporan Terkirim!</h1>
        <p class="text-muted-foreground mb-6">Laporan Anda telah diterima dan akan segera ditindaklanjuti.</p>

        <div class="bg-muted rounded-lg p-6 mb-6">
            <p class="text-sm text-muted-foreground mb-1">Nomor Tiket Anda</p>
            <p class="text-2xl font-mono font-bold text-primary">{{ ticket }}</p>
        </div>

        <p class="text-sm text-muted-foreground mb-6">
            Simpan nomor tiket untuk melacak status laporan Anda.
        </p>

        <Button @click="router.push('/lacak')">Lacak Laporan →</Button>
    </div>
</template>
```

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: wizard form pages (Step 1-4) + success page"
```

### Task 7.3: MapPicker component (Google Maps)

**Files:**
- Create: `resources/js/components/MapPicker.vue`
- Create: `resources/js/services/googleMapsLoader.ts`
- Create: `resources/js/composables/useGeolocation.ts`

- [ ] **Step 1: googleMapsLoader.ts**

```typescript
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let googleMapsPromise: Promise<typeof google> | null = null;

export async function loadGoogleMaps(): Promise<typeof google> {
    if (!googleMapsPromise) {
        setOptions({
            key: import.meta.env.VITE_GOOGLE_MAP_KEY as string,
            version: 'weekly',
        });

        googleMapsPromise = Promise.all([
            importLibrary('maps'),
            importLibrary('places'),
            importLibrary('marker'),
        ]).then(() => window.google);
    }

    return googleMapsPromise;
}
```

- [ ] **Step 2: useGeolocation.ts**

```typescript
import { ref } from 'vue';

export function useGeolocation() {
    const lat = ref<number | null>(null);
    const lng = ref<number | null>(null);
    const error = ref<string>('');
    const loading = ref(false);

    async function getPosition(): Promise<{ lat: number; lng: number } | null> {
        loading.value = true;
        error.value = '';

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                error.value = 'Geolokasi tidak didukung browser ini.';
                loading.value = false;
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    lat.value = pos.coords.latitude;
                    lng.value = pos.coords.longitude;
                    loading.value = false;
                    resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    error.value = 'Tidak dapat mengakses lokasi.';
                    loading.value = false;
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000 },
            );
        });
    }

    return { lat, lng, error, loading, getPosition };
}
```

- [ ] **Step 3: MapPicker.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { useGeolocation } from '@/composables/useGeolocation';
import { Button } from '@/components/ui/button';

const emit = defineEmits<{ update: [lat: number, lng: number, source: 'gps' | 'ip' | 'manual'] }>();

const mapDiv = ref<HTMLDivElement>();
const markerPosition = ref<{ lat: number; lng: number } | null>(null);
const { getPosition, loading: geoLoading } = useGeolocation();

const defaultCenter = { lat: -7.150975, lng: 110.140259 }; // Pusat Jawa Tengah

onMounted(async () => {
    const google = await loadGoogleMaps();

    const map = new google.maps.Map(mapDiv.value!, {
        center: defaultCenter,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    let marker: google.maps.marker.AdvancedMarkerElement | null = null;

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
        const pos = e.latLng!;
        markerPosition.value = { lat: pos.lat(), lng: pos.lng() };

        if (!marker) {
            marker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: pos,
                gmpDraggable: true,
            });
            marker.addListener('dragend', () => {
                const p = marker!.position as google.maps.LatLng;
                markerPosition.value = { lat: p.lat(), lng: p.lng() };
                emit('update', p.lat(), p.lng(), 'manual');
            });
        } else {
            marker.position = pos;
        }

        map.panTo(pos);
        emit('update', pos.lat(), pos.lng(), 'manual');
    });

    // Places Autocomplete search box
    const input = document.getElementById('map-search') as HTMLInputElement;
    if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'ID' },
        });
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                const loc = place.geometry.location;
                map.setCenter(loc);
                map.setZoom(16);
                markerPosition.value = { lat: loc.lat(), lng: loc.lng() };
                emit('update', loc.lat(), loc.lng(), 'manual');
            }
        });
    }
});

async function useMyLocation() {
    const pos = await getPosition();
    if (pos) {
        markerPosition.value = pos;
        emit('update', pos.lat, pos.lng, 'gps');
    }
}
</script>

<template>
    <div class="space-y-2">
        <div class="flex gap-2">
            <input
                id="map-search"
                type="text"
                placeholder="Cari alamat..."
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
            <Button variant="outline" size="sm" :disabled="geoLoading" @click="useMyLocation">
                {{ geoLoading ? '...' : '📍 Lokasi Saya' }}
            </Button>
        </div>
        <div ref="mapDiv" class="w-full h-[300px] rounded-md border" />
    </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Google Maps picker with Places Autocomplete and geolocation"
```

### Task 7.4: Tracking page

**Files:**
- Create: `resources/js/pages/TrackingPage.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

const ticket = ref('');
const phone = ref('');
const loading = ref(false);
const result = ref<any>(null);
const error = ref('');

const statusLabel: Record<string, string> = {
    baru: 'Baru',
    diproses: 'Sedang Diproses',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
};

const statusVariant: Record<string, string> = {
    baru: 'default',
    diproses: 'secondary',
    selesai: 'default',
    ditolak: 'destructive',
};

async function track() {
    loading.value = true;
    error.value = '';
    result.value = null;

    try {
        const { data } = await api.get('/aduan/track', {
            params: { ticket: ticket.value, phone: phone.value.replace(/\D/g, '') },
        });
        result.value = data;
    } catch (e: any) {
        if (e.response?.status === 404) {
            error.value = 'Laporan tidak ditemukan. Periksa nomor tiket dan WA Anda.';
        } else {
            error.value = 'Gagal melacak. Coba lagi.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto py-16 px-4">
        <h1 class="text-2xl font-bold text-center mb-2">Lacak Laporan</h1>
        <p class="text-muted-foreground text-center mb-8">Masukkan nomor tiket dan nomor WA yang digunakan saat melapor.</p>

        <div class="space-y-4 mb-6">
            <div class="space-y-2">
                <Label for="ticket">Nomor Tiket</Label>
                <Input id="ticket" v-model="ticket" placeholder="ADN-20260714-0001" />
            </div>
            <div class="space-y-2">
                <Label for="track-phone">Nomor WhatsApp</Label>
                <Input id="track-phone" v-model="phone" placeholder="0812xxxxxxxx" />
            </div>
            <Button class="w-full" :disabled="!ticket || !phone || loading" @click="track">
                {{ loading ? 'Mencari...' : 'Lacak' }}
            </Button>
        </div>

        <p v-if="error" class="text-destructive text-center text-sm">{{ error }}</p>

        <Card v-if="result">
            <CardHeader>
                <CardTitle class="text-lg">Status Laporan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Tiket:</span>
                    <span class="font-mono font-medium">{{ result.ticket_number }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Status:</span>
                    <Badge :variant="statusVariant[result.status]">{{ statusLabel[result.status] }}</Badge>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Kab/Kota:</span>
                    <span>{{ result.kabupaten_kota }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Jenis:</span>
                    <span>{{ result.jenis_rokok }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">Dilaporkan:</span>
                    <span>{{ new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
```

- [ ] **Step 1: Commit**

```bash
git add -A && git commit -m "feat: tracking page with ticket + phone lookup"
```

---

## Phase 8: Frontend — Admin Pages

### Task 8.1: Auth store + Admin layout

**Files:**
- Create: `resources/js/stores/authStore.ts`
- Create: `resources/js/components/admin/AdminLayout.vue`
- Create: `resources/js/pages/admin/AdminLoginPage.vue`

```typescript
// authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '');
    const user = ref<any>(null);

    const isAuthenticated = computed(() => !!token.value);

    async function login(email: string, password: string) {
        const { data } = await api.post('/admin/login', { email, password });
        token.value = data.token;
        user.value = data.user;
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }

    function logout() {
        api.post('/admin/logout').catch(() => {});
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        router.push('/admin/login');
    }

    function initFromStorage() {
        if (token.value) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        }
    }

    return { token, user, isAuthenticated, login, logout, initFromStorage };
});
```

```vue
<!-- AdminLayout.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/aduan', label: 'Daftar Aduan' },
];
</script>

<template>
    <div class="min-h-screen bg-background">
        <header class="border-b">
            <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <h1 class="font-bold text-lg">Pancen Jateng</h1>
                    <nav class="flex gap-4">
                        <router-link
                            v-for="item in navItems"
                            :key="item.path"
                            :to="item.path"
                            class="text-sm"
                            :class="route.path === item.path ? 'text-primary font-medium' : 'text-muted-foreground'"
                        >
                            {{ item.label }}
                        </router-link>
                    </nav>
                </div>
                <Button variant="ghost" size="sm" @click="auth.logout()">Logout</Button>
            </div>
        </header>
        <main class="max-w-7xl mx-auto px-4 py-6">
            <slot />
        </main>
    </div>
</template>
```

- [ ] **Step 1: Commit**

```bash
git add -A && git commit -m "feat: auth store + admin layout + login page"
```

### Task 8.2: Admin Dashboard page

**Files:**
- Create: `resources/js/pages/admin/AdminDashboardPage.vue`
- Create: `resources/js/components/admin/StatsCards.vue`

- [ ] **Step 1: Create dashboard with stats cards, status pie, recent list. Commit.**

(Same pattern — fetch from `/api/admin/dashboard`, render cards + chart. I'll implement this inline during execution.)

### Task 8.3: Admin Aduan List + Detail pages

**Files:**
- Create: `resources/js/pages/admin/AdminAduanListPage.vue`
- Create: `resources/js/pages/admin/AdminAduanDetailPage.vue`
- Create: `resources/js/components/admin/AduanTable.vue`

- [ ] **Step 1: Create list page with filters, search, pagination, table. Commit.**

- [ ] **Step 2: Create detail page with all fields, status dropdown, map, photo. Commit.**

---

## Phase 9: Finishing

### Task 9.1: Landing page + App.vue wrapper

**Files:**
- Create: `resources/js/App.vue`
- Modify: `resources/views/welcome.blade.php` (Laravel entry point)

- [ ] **Step 1: Root blade view loads Vue app**

```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pancen Jateng — Lapor Rokok Ilegal</title>
    @vite(['resources/js/app.ts'])
</head>
<body class="min-h-screen bg-background font-sans antialiased">
    <div id="app"></div>
</body>
</html>
```

- [ ] **Step 2: App.vue with router-view**

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const auth = useAuthStore();
onMounted(() => auth.initFromStorage());
</script>

<template>
    <router-view />
</template>
```

- [ ] **Step 3: Set catch-all route in Laravel**

```php
// routes/web.php
Route::get('/{any}', fn () => view('welcome'))->where('any', '.*');
```

- [ ] **Step 4: Verify full flow**

Run: `php artisan serve` and `npm run dev`
Verify:
1. Open `/lapor` → wizard form renders
2. Fill all steps → submit → see success page with ticket
3. Open `/lacak` → enter ticket+phone → see status
4. Open `/admin/login` → login → see dashboard

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "feat: complete Pancen Jateng v1 - wizard form, tracking, admin dashboard"
```

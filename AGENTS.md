# AGENTS.md — mikrotik-laravel

Panduan ini untuk AI coding agent (Claude Code, Copilot, dsb.) dan kontributor manusia yang bekerja di repository `Ballon14/mikrotik-laravel` — **MikroTik Dashboard Monitor & Billing System**, sebuah dashboard web untuk memonitor router MikroTik RouterOS secara real-time sekaligus mengelola billing ISP/PPPoE, dibangun dengan Laravel.

## 1. Ringkasan Project

- **Framework**: Laravel 12 (PHP ^8.2)
- **Frontend**: Blade Templates + Vanilla JS/CSS (dark glassmorphism UI), di-bundle dengan **Vite** + Tailwind CSS v4
- **Database**: SQLite (default) atau MySQL, untuk data billing & session
- **Koneksi Router**: custom `RouterosAPI` (plaintext API login, kompatibel RouterOS v6.43+) via port `8728`
- **Arsitektur khas**: daemon polling background (`php artisan mikrotik:monitor`) yang membuka **satu koneksi persisten** ke router, menyimpan data ke Laravel `Cache`, sehingga web dashboard membaca dari Cache (bukan hit router langsung tiap request) — ini penting untuk dijaga, jangan diubah ke pola "connect per-request" tanpa alasan kuat.

## 2. Struktur Project (aktual)

```
app/
  Console/Commands/
    MikrotikMonitor.php       # Daemon: php artisan mikrotik:monitor
  Http/Controllers/
    AuthController.php        # Login/logout dashboard
    MikrotikController.php    # Semua endpoint API monitoring & CRUD Mikrotik (interfaces, dhcp, firewall, arp, hotspot, ip-address, ip-isolation)
    BillingController.php     # Endpoint API billing (packages, customers, invoices)
    Controller.php
  Models/
    Customer.php
    Invoice.php
    Package.php
    User.php
  Services/
    MikrotikService.php       # Wrapper high-level ke RouterosAPI (query/execute + CRUD helpers)
    RouterosAPI.php           # Low-level RouterOS API client (socket, login, comm)
config/
  database.php, app.php, dll (config Laravel standar)
database/
  migrations/                 # termasuk packages, customers, invoices
  seeders/DatabaseSeeder.php  # seed admin default
resources/
  css/app.css, js/app.js, js/billing.js
  views/
    layouts/ (app.blade.php, guest.blade.php)
    components/ (header, sidebar)
    pages/ (overview, interfaces, dhcp, routes, firewall, arp, logs, hotspot,
             ip-addresses, ip-isolation, login, billing/*)
routes/
  web.php                     # semua route: view + prefix /api untuk endpoint JSON
  console.php
tests/
  Feature/ExampleTest.php
  Unit/ExampleTest.php
public/
vite.config.js
phpunit.xml
```

## 3. Environment Variables

`.env.example` berisi konfigurasi Laravel standar (APP_*, DB_*, SESSION_*, dll). **Kredensial MikroTik tidak ada di `.env.example`** — sesuai README, harus ditambahkan manual di akhir `.env`:

```env
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=yourpassword
```

Catatan penting:
- **Jangan** sertakan `http://` atau port di `MIKROTIK_HOST` — hanya IP.
- `MikrotikService.php` dan `MikrotikMonitor.php` punya default fallback (`10.10.10.1` / `iqbal` / `iqbal123`) jika env kosong — ini **hanya untuk dev lokal milik pembuat awal**, jangan andalkan default ini di environment lain; selalu set eksplisit di `.env`.
- `SESSION_DRIVER=database` dan `CACHE_STORE=database` — pastikan migration session/cache table sudah jalan sebelum app dipakai (bawaan Laravel: `cache`, `jobs`, `sessions` table ada di migration awal).
- Default admin login setelah seeding: `admin@billing.com` / `admin` — **wajib diganti** sebelum deploy ke production.

## 4. Standar Kode

- Ikuti PSR-12 dan konvensi Laravel standar (PascalCase untuk class, camelCase untuk method).
- Semua komunikasi ke router **harus** lewat `App\Services\MikrotikService` — jangan panggil `RouterosAPI` langsung dari Controller.
- Saat menambah fitur CRUD baru ke Mikrotik (mis. resource baru selain DHCP/Firewall/IP Address), ikuti pola yang sudah ada di `MikrotikService.php`:
  - method `query()` untuk read-only, `execute()` untuk write/CRUD
  - filter param pakai `!empty()` untuk `add`, `isset()` untuk `set` (update parsial)
  - endpoint baru ditambahkan di `MikrotikController.php`, lalu didaftarkan di `routes/web.php` dalam grup `middleware('auth')->prefix('api')`
- Jangan pernah mengubah pola daemon (`MikrotikMonitor`) menjadi connect-per-request — ini pattern inti yang mencegah spam login ke router.
- Untuk fitur billing (Package/Customer/Invoice), gunakan Eloquent Model + relasi yang sudah ada, jangan query manual.
- Gunakan Laravel Pint untuk format kode sebelum commit: `./vendor/bin/pint`.

## 5. Testing

```bash
php artisan test
# atau
./vendor/bin/phpunit
```

- Test yang menyentuh `MikrotikService`/`RouterosAPI` **wajib di-mock** (jangan hit router asli di test/CI) — router fisik tidak tersedia di lingkungan CI.
- Saat ini repo baru punya test skeleton (`tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php`) — tambahkan test nyata untuk setiap Controller/Service baru sebelum PR di-merge, terutama untuk logic billing (invoice, status pelanggan) yang sensitif terhadap uang.

## 6. Menjalankan Project Secara Lokal

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
# tambahkan MIKROTIK_HOST/USER/PASSWORD di .env
php artisan migrate --seed
npm run build   # atau: npm run dev
```

Jalankan **dua proses terpisah**:
```bash
# Terminal 1 — daemon polling ke router
php artisan mikrotik:monitor

# Terminal 2 — web server
php artisan serve
```

## 7. Alur Kontribusi

1. Branch dari `main`: `feature/<nama-fitur>` atau `fix/<nama-bug>`.
2. Jalankan `./vendor/bin/pint` dan `php artisan test` sebelum commit.
3. Commit message jelas (disarankan [Conventional Commits](https://www.conventionalcommits.org/)).
4. Buka PR ke `main`. Jika perubahan menyentuh `MikrotikService`/`RouterosAPI`/`MikrotikMonitor`, jelaskan dampaknya ke koneksi router di deskripsi PR.
5. CI harus hijau sebelum merge.

## 8. CI/CD

### CI — `.github/workflows/ci.yml`
Jalan setiap `push`/`pull_request` ke `main`:
- Setup PHP 8.2 + ekstensi yang dibutuhkan (termasuk `sockets`, karena `RouterosAPI` pakai koneksi socket TCP ke router)
- `composer install`
- Setup `.env` dengan SQLite in-memory/file untuk testing (tidak menyentuh router asli)
- `php artisan migrate`
- `npm ci && npm run build` (Vite + Tailwind)
- Cek code style: `./vendor/bin/pint --test`
- `php artisan test`

### CD — `.github/workflows/cd.yml`
Jalan saat push ke `main` (setelah CI sukses), deploy ke server via SSH:
- `composer install --no-dev --optimize-autoloader`
- `npm ci && npm run build`
- Upload build ke server, jalankan `migrate --force`, `config:cache`, `route:cache`, `view:cache`
- Restart daemon `mikrotik:monitor` (lewat Supervisor) — **wajib**, karena daemon ini proses long-running terpisah dari web server dan tidak otomatis restart saat deploy biasa.

**Secrets yang perlu diset di GitHub (Settings → Secrets and variables → Actions):**
| Secret | Keterangan |
|---|---|
| `SSH_HOST` | IP/hostname server deploy |
| `SSH_USER` | User SSH |
| `SSH_KEY` | Private key SSH |
| `DEPLOY_PATH` | Path project di server |

> Kredensial `MIKROTIK_HOST/USER/PASSWORD` **tidak perlu** jadi GitHub secret kecuali kamu ingin test koneksi ke router asli dari CI (tidak disarankan) — cukup diset langsung di `.env` server production.

## 9. Perhatian Khusus

- Jangan hardcode kredensial router di kode — selalu lewat `.env`.
- Jangan commit `.env`, database SQLite (`database/database.sqlite`), atau private key SSH.
- Fitur **IP Isolation** (`isolateIp`/`unisolateIp` di `MikrotikService`) menambah/menghapus firewall rule di router asli secara langsung — perubahan pada logic ini harus hati-hati diuji (mock), karena bug bisa memblokir/membuka akses customer secara tidak sengaja.
- Daemon `mikrotik:monitor` adalah proses yang harus selalu hidup di production (pakai Supervisor/systemd), bukan dijalankan manual tiap deploy.
- Perubahan skema billing (`Package`, `Customer`, `Invoice`) harus lewat migration baru, jangan edit migration lama yang sudah pernah di-deploy.

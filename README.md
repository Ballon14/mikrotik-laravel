# MikroTik Dashboard Monitor & Billing System

> Dashboard monitoring MikroTik RouterOS real-time + sistem billing ISP/PPPoE.
> Laravel 12 · PHP 8.2 · Background daemon architecture.

📚 Dokumentasi lengkap:
[Teknologi](docs/teknologi.md) · [API Reference](docs/api.md) · [Coding Rules](docs/rules.md)

---

## Features

### Network Monitoring
- **System Overview** — CPU, RAM, storage, uptime, traffic charts with visual health thresholds
- **Interfaces** — Status, MAC, traffic rates, RX/TX history (60 data points via modal)
- **DHCP Leases** — CRUD table with one-click IP isolation
- **Firewall** — Filter & NAT rules with full CRUD
- **IP Addresses** — CRUD management
- **ARP Table** — Entries with isolation status
- **IP Isolation** — Isolate/unisolate IPs via firewall rules
- **Routes** — Active/inactive routing table
- **DNS** — Monitor configuration
- **Logs** — Real-time system logs with severity coloring
- **Hotspot** — Active hotspot users
- **Traffic History** — Per-interface RX/TX charts (Canvas 2D)
- **Health Monitoring** — Daemon status, stale cache, connection error banner

### ISP/PPPoE Billing
- **Dashboard** — Stats (active/isolated/total), monthly revenue chart, recent payments
- **Packages** — Define internet packages (name, price, speed, billing period)
- **Customers** — Register with PPPoE credentials, link to package, track status
- **Invoices** — Generate bills, track payment dates, period start/end
- **Payments** — Record (transfer/cash/QRIS), auto-mark invoice as paid
- **PPPoE Accounts** — Manage and sync with MikroTik PPP secrets
- **Multi-Router** — Register multiple routers with individual credentials
- **Overdue Auto-Isolation** — Auto-disable 3+ days overdue
- **Audit Trail** — All changes logged with old/new values

### UX
- Dark glassmorphism UI, responsive, mobile slide-out sidebar
- PWA (installable, service worker caching)
- Smart confirmation dialogs (button text: Hapus/Simpan/Blokir)
- Loading states on form submits (prevents double-click)
- Sidebar badges with live counts
- Toast notifications

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         php artisan serve                    │
│    (Laravel Web Application)                │
│                                              │
│  Web Dashboard ──reads──> Laravel Cache     │
│  (Blade + Vite)            TTL: 180s        │
└─────────────────────────────────────────────┘
         ▲                       ▲
         │                       │ writes (2-10s)
         │                       │
┌────────┴───────────────────────┴───────────┐
│      php artisan mikrotik:monitor           │
│     (Background Daemon — persistent socket) │
│                                              │
│  Fast Cycle (2s): interfaces, traffic       │
│  Slow Cycle (10s): DHCP, routes, firewall   │
└───────────────────────────────┬─────────────┘
                                │ port 8728
                                ▼
                       ┌─────────────────┐
                       │  MikroTik Router │
                       │  RouterOS v6.43+ │
                       └─────────────────┘
```

The daemon opens a **single persistent TCP connection** to the router, polls data continuously, and stores results in Laravel cache. The web dashboard reads from cache only — never connecting directly on page requests.

### Daemon Health Check

Frontend polls `/api/daemon-status` every 5s:
- **Healthy** → green indicator, live data
- **3 consecutive failures** → polling stops, warning banner + "Coba Lagi" button
- **Reconnection** → click "Coba Lagi" or fix connection, resumes automatically
- **Stale cache** → on transient errors, preserves last successful cache entry

---

## Prerequisites

- PHP 8.2+ (extensions: `sockets`, `mbstring`)
- Composer, Node.js & NPM
- MySQL or SQLite (billing, sessions, queue)
- MikroTik RouterOS v6.43+ with API enabled:
  ```
  /ip service set api disabled=no port=8728
  ```
- Supervisor (recommended for production)

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Ballon14/mikrotik-laravel.git
cd mikrotik-laravel
composer install
npm install && npm run build
```

### 2. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` — wajib isi:

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `MIKROTIK_HOST` | ✅ | IP router (tanpa `http://`) |
| `MIKROTIK_USER` | ✅ | Username API router |
| `MIKROTIK_PASSWORD` | ✅ | Password API router |
| `DB_CONNECTION` | ❌ | `sqlite` (default) / `mysql` |
| `CACHE_STORE` | ❌ | `file` (default) |
| `QUEUE_CONNECTION` | ❌ | `database` (default) |
| `SESSION_DRIVER` | ❌ | `database` (default) |
| `APP_DEBUG` | ❌ | `false` di production |

### 3. Database

```bash
php artisan migrate --seed
```

Login default: `admin@billing.com` / `admin` — **ganti segera di production**.

### 4. Run

**Quick start (semua proses):**
```bash
bin/start.sh
```

**Manual (3 terminal):**
```bash
# Terminal 1 — daemon polling
php artisan mikrotik:monitor

# Terminal 2 — web server
php artisan serve

# Terminal 3 — queue worker (billing sync)
php artisan queue:work
```

**Stop:**
```bash
bin/stop.sh
```

### 5. Access

Open **http://localhost:8000**

---

## Production Deployment

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

### Supervisor

```ini
; /etc/supervisor/conf.d/mikrotik-daemon.conf
[program:mikrotik-daemon]
command=php /path/to/artisan mikrotik:monitor
autostart=true
autorestart=true
user=www-data
directory=/path/to/project
stdout_logfile=/path/to/project/storage/logs/daemon.log

[program:mikrotik-queue]
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
directory=/path/to/project
stdout_logfile=/path/to/project/storage/logs/queue.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

---

## Maintenance

```bash
# Clear & re-optimize
php artisan optimize:clear
php artisan optimize

# Restart after update
bin/stop.sh && bin/start.sh

# View logs
tail -f storage/logs/daemon.log

# Failed queue jobs
php artisan queue:failed

# List commands
php artisan list | grep mikrotik
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Daemon tidak connect | Cek `MIKROTIK_*` di `.env`. Enable API: `/ip service set api disabled=no` |
| Data dashboard stale | Cek `/api/daemon-status`. Jika `healthy: false`, restart daemon |
| Billing sync error | Pastikan `php artisan queue:work` jalan. Cek tabel `failed_jobs` |
| PWA tidak install | Harus HTTPS (atau localhost) |
| Blank page | Cek console browser. Jalankan `npm run build` |
| Cache error | `CACHE_STORE=database` lambat — ganti ke `file` |

---

## License

MIT — open source.

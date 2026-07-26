# MikroTik Dashboard Monitor & Billing System

A modern, high-performance web dashboard for monitoring MikroTik RouterOS devices, complete with a built-in ISP/PPPoE billing system. Built with **Laravel 12** (PHP 8.2+), featuring a background daemon architecture that maintains a single persistent connection to the router for real-time metrics without spamming router logs or consuming excessive CPU.

## Features

### Network Monitoring
- **System Overview** — Real-time CPU, RAM, storage, uptime, and traffic charts with visual health thresholds
- **Interfaces** — Status, MAC addresses, traffic rates, RX/TX history charts (60 data points per interface via modal)
- **DHCP Leases** — Table with CRUD (create, read, update, delete) operations
- **Firewall** — Filter and NAT rules with full CRUD
- **IP Addresses** — Manage router IP addresses with CRUD
- **ARP Table** — View ARP entries with IP isolation status indicators
- **IP Isolation** — Isolate/unisolate IPs instantly via automated firewall rules
- **Routes** — View active/inactive routing table entries
- **DNS** — Monitor DNS configuration
- **Logs** — Real-time system logs with severity coloring
- **Hotspot** — View active hotspot users
- **Traffic History** — Per-interface RX/TX rate history with interactive charts
- **Health Monitoring** — Daemon status endpoint, stale cache indicator, connection error banner

### Daemon Cached Data

| Cache Key | Source Command | Update Cycle |
|-----------|---------------|--------------|
| `mikrotik_data_resource` | `/system/resource/print` | Every 2s |
| `mikrotik_data_interfaces` | `/interface/print` | Every 2s |
| `mikrotik_data_identity` | `/system/identity/print` | Every 10s |
| `mikrotik_data_dhcp` | `/ip/dhcp-server/lease/print` | Every 10s |
| `mikrotik_data_routes` | `/ip/route/print` | Every 10s |
| `mikrotik_data_fw_filter` | `/ip/firewall/filter/print` | Every 10s |
| `mikrotik_data_fw_nat` | `/ip/firewall/nat/print` | Every 10s |
| `mikrotik_data_arp` | `/ip/arp/print` | Every 10s |
| `mikrotik_data_ip_addresses` | `/ip/address/print` | Every 10s |
| `mikrotik_data_dns` | `/ip/dns/print` | Every 10s |
| `mikrotik_data_logs` | `/log/print` (last 50) | Every 10s |
| `mikrotik_data_hotspot_active` | `/ip/hotspot/active/print` | Every 10s |
| `mikrotik_data_isolated_ips` | Derived from fw_filter | Every 10s |
| `mikrotik_traffic_hist_{name}` | Rate calculation | Every 2s (60 data points) |

### ISP/PPPoE Billing
- **Dashboard** — Stats (active/isolated/total customers), monthly revenue chart, recent payments
- **Packages** — Define internet packages (name, price, speed, billing period)
- **Customers** — Register with PPPoE credentials, link to packages, track status
- **Invoices** — Generate bills, track payment dates, period start/end
- **Payments** — Record payments (transfer/cash/QRIS), auto-mark invoice as paid
- **PPPoE Accounts** — Manage and sync with MikroTik PPP secrets
- **Multi-Router** — Register multiple routers with individual credentials
- **Overdue Auto-Isolation** — Automatically disable accounts 3+ days overdue
- **Audit Trail** — All changes logged with old/new values for traceability

### UX
- Dark glassmorphism UI with responsive layout and mobile slide-out sidebar
- PWA support (installable, offline-ready with service worker caching)
- Pagination on all data tables
- **Smart confirmation dialogs** — button text auto-adapts: "Hapus" for deletes, "Simpan" for saves, "Blokir"/"Buka Blokir" for isolation toggles
- **Loading states** — submit buttons show "Menyimpan..." and disable during form submission (prevents double-click)
- Toast notifications for success/error feedback
- Lucide icon set with consistent styling
- Sidebar badges showing live counts (interfaces, DHCP, ARP, routes, firewall, hotspot, IPs, isolated)

## Sidebar Navigation

| Section | Page | Badge | Description |
|---------|------|-------|-------------|
| **Billing System** | Dashboard | — | Billing overview: active customers, revenue, recent payments |
| | Packages | — | Internet package definitions (name, price, speed, billing period) |
| | Customers | — | Customer registry with PPPoE credentials and status |
| | Invoices | — | Bill generation, payment tracking, overdue management |
| | Payments | — | Payment records with auto-invoice status updates |
| | PPPoE Accounts | — | PPPoE secrets management with one-click sync to router |
| | Routers | — | Multi-router credential storage (passwords hidden in API) |
| | Audit Logs | — | Full CRUD audit trail with old/new value diffs |
| **Monitoring** | System Overview | — | CPU, RAM, storage, uptime, traffic charts, quick stats |
| | Interfaces | count | Interface list with status, MAC, traffic totals |
| | DHCP Leases | count | DHCP lease table with CRUD and one-click IP isolation |
| | ARP Table | count | ARP entries with isolation status indicators |
| **Network** | IP Addresses | count | Router IP address management with CRUD |
| | Routing Table | count | Active/inactive routes |
| | Firewall Rules | count | Filter + NAT rules with full CRUD (total count badge) |
| | IP Isolation | count | Isolate/unisolate IPs via automated firewall rules (red badge if any) |
| **Services** | Hotspot Active | count | Currently active hotspot users |
| | System Logs | — | Real-time system log viewer with severity coloring |

Count badges update live from cache on every polling cycle.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  php artisan serve                    │
│             (Laravel Web Application)                 │
│                                                       │
│   Web Dashboard  ──reads──>  Laravel Cache  (file)   │
│   (Blade + Vite)              TTL: 180s               │
└──────────────────────────────────────────────────────┘
         ▲                         ▲
         │                         │ writes (every 2-10s)
         │                         │
┌────────┴─────────────────────────┴───────────────────┐
│           php artisan mikrotik:monitor                 │
│          (Background Daemon — persistent socket)       │
│                                                        │
│   Fast Cycle (2s): interfaces, traffic history         │
│   Slow Cycle (10s): DHCP, routes, firewall, logs, etc │
└─────────────────────────────────┬─────────────────────┘
                                  │ connects via port 8728
                                  ▼
                         ┌─────────────────┐
                         │  MikroTik Router │
                         │  RouterOS v6.43+ │
                         └─────────────────┘
```

The daemon opens a **single persistent TCP connection** to the router and continuously polls data, storing results in Laravel's cache. The web dashboard reads from cache only — never connecting to the router directly on page requests. This prevents login spam in Winbox logs and keeps page loads sub-millisecond.

### Daemon Health Check

The frontend polls `/api/daemon-status` every 5 seconds:

- **Healthy**: Green connection indicator, live data updates
- **3 consecutive failures**: Polling stops automatically, warning banner appears with "Coba Lagi" button
- **Reconnection**: Click "Coba Lagi" or fix the connection — polling resumes automatically
- **Stale cache**: On transient errors, the daemon preserves the last successful cache entry (TTL: 180s), preventing blank UI

## Prerequisites

- PHP 8.2+ (with `sockets` and `mbstring` extensions)
- Composer
- Node.js & NPM
- MySQL or SQLite (for billing, sessions, queue)
- MikroTik RouterOS v6.43+ with API service enabled:
  ```
  /ip service set api disabled=no port=8728
  ```
- Supervisor (recommended for production daemon management)

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Ballon14/mikrotik-laravel.git
cd mikrotik-laravel
composer install
npm install
npm run build
```

### 2. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_CONNECTION` | yes | `mysql` | `mysql` or `sqlite` |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, etc | if mysql | — | Database credentials |
| `SESSION_DRIVER` | yes | `database` | Session storage driver |
| `CACHE_STORE` | yes | `file` | Cache driver (`file` recommended over `database`) |
| `QUEUE_CONNECTION` | yes | `database` | Queue driver for billing jobs |
| `MIKROTIK_HOST` | yes | — | Router IP (no `http://` or port) |
| `MIKROTIK_USER` | yes | — | Router API username |
| `MIKROTIK_PASSWORD` | yes | — | Router API password |
| `APP_DEBUG` | no | `true` | Set to `false` in production |

### 3. Database Setup
```bash
php artisan migrate --seed
```
Default admin login: `admin@billing.com` / `admin` — **change immediately in production**.

### 4. Run the Application

**Quick start (recommended):**
```bash
bin/start.sh
```
This starts all three processes (daemon, queue worker, web server) and shows their status.

**Manual start** (three terminals):
```bash
# Terminal 1 — Polling daemon (persistent connection to router)
php artisan mikrotik:monitor

# Terminal 2 — Web server
php artisan serve

# Terminal 3 — Queue worker (required for billing sync)
php artisan queue:work
```

**Stop all:**
```bash
bin/stop.sh
```

### 5. Access
Open **http://localhost:8000** in your browser.

### Production Deployment

```bash
# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build frontend
npm run build
```

**Supervisor** is required for the daemon and queue worker (they must survive SSH disconnects and server restarts):

```bash
# /etc/supervisor/conf.d/mikrotik-daemon.conf
[program:mikrotik-daemon]
command=php /path/to/artisan mikrotik:monitor
autostart=true
autorestart=true
user=www-data
directory=/path/to/project
stdout_logfile=/path/to/project/storage/logs/daemon.log
stderr_logfile=/path/to/project/storage/logs/daemon.log

# /etc/supervisor/conf.d/mikrotik-queue.conf
[program:mikrotik-queue]
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
directory=/path/to/project
stdout_logfile=/path/to/project/storage/logs/queue.log
stderr_logfile=/path/to/project/storage/logs/queue.log
```

Then reload Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### Maintenance

```bash
# Regenerate all cache (after config changes)
php artisan optimize:clear
php artisan optimize

# Restart daemon after code updates
bin/stop.sh && bin/start.sh

# View daemon logs
tail -f storage/logs/daemon.log

# Check failed queue jobs
php artisan queue:failed

# List all artisan commands
php artisan list | grep mikrotik
```

## API Endpoints

All API endpoints under `/api` require authentication (except `/api/health` and `/api/daemon-status`).

### Monitoring (read from cache)
| Endpoint | Description |
|---|---|
| `GET /api/router` | System resource (CPU, RAM, uptime) |
| `GET /api/identity` | Router identity |
| `GET /api/interfaces` | All interfaces |
| `GET /api/interface/{name}` | Single interface detail |
| `GET /api/traffic/{name}` | Traffic history (60 data points) |
| `GET /api/dhcp-leases` | DHCP leases |
| `GET /api/routes` | Routing table |
| `GET /api/firewall/filter` | Firewall filter rules |
| `GET /api/firewall/nat` | Firewall NAT rules |
| `GET /api/ip-addresses` | IP addresses |
| `GET /api/arp` | ARP table |
| `GET /api/logs` | System logs (last 50) |
| `GET /api/hotspot/active` | Active hotspot users |
| `GET /api/dns` | DNS configuration |
| `GET /api/isolated-ips` | Currently isolated IPs |
| `GET /api/health` | Daemon & cache health |
| `GET /api/daemon-status` | Daemon running status |

### Monitoring CRUD (writes to router directly)
| Endpoint | Description |
|---|---|
| `POST/PUT/DELETE /api/dhcp-leases/{id}` | DHCP lease CRUD |
| `POST/PUT/DELETE /api/firewall/filter/{id}` | Firewall filter CRUD |
| `POST/PUT/DELETE /api/firewall/nat/{id}` | Firewall NAT CRUD |
| `POST/PUT/DELETE /api/ip-addresses/{id}` | IP address CRUD |
| `POST /api/isolate-ip` | Isolate an IP |
| `POST /api/unisolate-ip` | Unisolate an IP |

### Billing API
| Endpoint | Description |
|---|---|
| `GET /api/billing/dashboard` | Billing stats & revenue data |
| `GET/POST /api/packages` | List (paginated) / Create package |
| `PUT/DELETE /api/packages/{id}` | Update / Delete package |
| `GET/POST /api/customers` | List / Create customer |
| `PUT/DELETE /api/customers/{id}` | Update / Delete customer |
| `GET/POST /api/invoices` | List / Create invoice |
| `PUT/DELETE /api/invoices/{id}` | Update / Delete invoice |
| `GET/POST /api/payments` | List / Create payment |
| `DELETE /api/payments/{id}` | Delete payment |
| `GET/POST /api/routers` | List / Create router |
| `PUT/DELETE /api/routers/{id}` | Update / Delete router |
| `GET/POST /api/pppoe-accounts` | List / Create PPPoE account |
| `PUT/DELETE /api/pppoe-accounts/{id}` | Update / Delete PPPoE account |
| `POST /api/pppoe-accounts/{id}/sync` | Sync account to router |
| `GET /api/audit-logs` | Audit trail (paginated) |

Support `?all=true` on list endpoints to bypass pagination and return all records.

### Audit Trail

The following operations are logged to the `audit_logs` table with old/new values:

| Action | Entity | Triggered By |
|--------|--------|-------------|
| `package_created` | Package | Form submit |
| `package_updated` | Package | Form submit (with value diff) |
| `package_deleted` | Package | Delete button |
| `customer_created` | Customer | Form submit |
| `customer_updated` | Customer | Form submit (with value diff) |
| `customer_deleted` | Customer | Delete button |
| `invoice_created` | Invoice | Form submit |
| `invoice_updated` | Invoice | Form submit (with value diff) |
| `invoice_deleted` | Invoice | Delete button |
| `payment_recorded` | Payment | Payment form submit |
| `payment_deleted` | Payment | Delete button |
| `router_created` | Router | Form submit |
| `router_updated` | Router | Form submit (with value diff) |
| `router_deleted` | Router | Delete button |
| `pppoe_account_created` | PPPoE Account | Form submit |
| `pppoe_account_updated` | PPPoE Account | Form submit (with value diff) |
| `pppoe_account_deleted` | PPPoE Account | Delete button |

## Project Structure

```
app/
├── Console/Commands/
│   ├── MikrotikMonitor.php        # Daemon: persistent polling loop
│   ├── BillingSyncPppoe.php       # CLI: sync all PPPoE to router
│   ├── BillingCheckOverdue.php    # CLI: check & isolate overdue
│   └── BillingGenerateInvoices.php # CLI: auto-generate invoices
├── Http/Controllers/
│   ├── AuthController.php         # Login/logout
│   ├── MikrotikController.php     # All monitoring endpoints
│   └── BillingController.php      # All billing endpoints
├── Jobs/
│   ├── SyncPppoeToRouter.php      # Queue job: sync single PPPoE
│   ├── CheckOverdueAccounts.php   # Queue job: overdue check
│   ├── GenerateInvoices.php       # Queue job: auto-invoice
│   └── ActivateCustomer.php       # Queue job: reactivate customer
├── Models/
│   ├── Package.php, Customer.php, Invoice.php
│   ├── Payment.php, PppoeAccount.php
│   ├── Router.php, AuditLog.php, User.php
└── Services/
    ├── RouterosAPI.php            # Low-level TCP socket client
    ├── MikrotikService.php        # High-level wrapper (query/execute)
    └── PppoeSyncService.php       # PPPoE sync to MikroTik
resources/
├── views/ (layouts, components, pages, billing/*)
├── js/ (app.js, billing.js)
└── css/ (app.css — Tailwind v4 + custom glassmorphism)
routes/
├── web.php                       # All web + API routes
└── console.php                   # Artisan commands
```

## Troubleshooting

| Problem | Solution |
|---|---|
| Daemon won't connect | Verify `MIKROTIK_HOST/USER/PASSWORD` in `.env`. Ensure API is enabled: `/ip service set api disabled=no` |
| Dashboard shows stale data | Check `/api/daemon-status`. If `healthy: false`, restart the daemon |
| Billing sync not working | Ensure `php artisan queue:work` is running. Check failed jobs table |
| PWA not installing | Must serve via HTTPS (or localhost). Service worker requires secure context |
| Blank page after login | Check browser console for JS errors. Run `npm run build` to rebuild Vite assets |
| Cache errors in daemon log | `CACHE_STORE=database` can be slow — switch to `CACHE_STORE=file` |

## Technology Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** Blade Templates, Vanilla JS, Tailwind CSS v4
- **Bundler:** Vite 7 + `vite-plugin-pwa`
- **Database:** MySQL / SQLite
- **Cache/Queue:** File / Database driver
- **Router API:** Plaintext API over TCP (RouterOS v6.43+)

## License

This project is open-sourced under the MIT license.

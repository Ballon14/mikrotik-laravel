# Teknologi yang Digunakan

## Backend

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Framework | **Laravel 12** | PHP 8.2+, full-stack MVC |
| PHP Extensions | `sockets`, `mbstring` | Socket TCP untuk koneksi ke RouterOS, mbstring untuk encoding |
| Router API | `RouterosAPI` (custom) | Koneksi plaintext TCP port 8728, kompatibel RouterOS v6.43+ |
| Database | MySQL / SQLite | SQLite default untuk development, MySQL untuk production |
| Cache | File / Database | `CACHE_STORE=file` (default) — lebih cepat dari database |
| Queue | Database | `QUEUE_CONNECTION=database` — untuk billing sync jobs |
| Session | Database | `SESSION_DRIVER=database` |

## Frontend

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Template | **Blade** | Laravel templating engine |
| CSS Framework | **Tailwind CSS v4** | Utility-first, kustom dark theme |
| CSS Kustom | `app.css` (~2300 baris) | Glassmorphism dark UI, sidebar, modal, chart, tabel, form styling |
| JavaScript | **Vanilla JS** (ES Modules) | Tanpa framework frontend — `app.js` + `billing.js` |
| Bundler | **Vite 7** + `vite-plugin-pwa` | Build cepat, HMR, service worker generation |
| Icons | **Lucide** | via unpkg CDN + `lucide.createIcons()` |
| Font | **Inter** (UI), **JetBrains Mono** (kode) | Google Fonts |
| Charts | **Canvas 2D API** (custom) | Traffic chart digambar manual tanpa Chart.js atau library pihak ketiga |

## Daemon Architecture

| Aspek | Detail |
|-------|--------|
| Proses | `php artisan mikrotik:monitor` — loop tak terbatas |
| Koneksi | 1 koneksi TCP persisten ke router (bukan connect per request) |
| Fast cycle | `/system/resource/print`, `/interface/print` — setiap 2 detik |
| Slow cycle | DHCP, routes, firewall, ARP, IP, dll — setiap 10 detik |
| Cache TTL | 180 detik — mencegah UI kosong saat error transient |
| Health check | Frontend cek `/api/daemon-status` tiap 5 detik |
| Failover | 3 gagal berurutan → polling berhenti, banner warning muncul |

## Daemon Cached Data

| Cache Key | Sumber | Siklus |
|-----------|--------|--------|
| `mikrotik_data_resource` | `/system/resource/print` | 2s |
| `mikrotik_data_interfaces` | `/interface/print` | 2s |
| `mikrotik_data_identity` | `/system/identity/print` | 10s |
| `mikrotik_data_dhcp` | `/ip/dhcp-server/lease/print` | 10s |
| `mikrotik_data_routes` | `/ip/route/print` | 10s |
| `mikrotik_data_fw_filter` | `/ip/firewall/filter/print` | 10s |
| `mikrotik_data_fw_nat` | `/ip/firewall/nat/print` | 10s |
| `mikrotik_data_arp` | `/ip/arp/print` | 10s |
| `mikrotik_data_ip_addresses` | `/ip/address/print` | 10s |
| `mikrotik_data_dns` | `/ip/dns/print` | 10s |
| `mikrotik_data_logs` | `/log/print` (last 50) | 10s |
| `mikrotik_data_hotspot_active` | `/ip/hotspot/active/print` | 10s |
| `mikrotik_data_isolated_ips` | Derived from fw_filter | 10s |
| `mikrotik_traffic_hist_{name}` | Rate calculation | 2s (60 data points) |

## PWA Support

- Service worker via `vite-plugin-pwa`
- Manifest: `/manifest.json`
- Apple touch icon + meta tags
- Offline cache for static assets
- Installable (requires HTTPS or localhost)

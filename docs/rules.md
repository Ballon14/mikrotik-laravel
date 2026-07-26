# Coding Rules & Standar

## 1. Standar Kode

- **PHP**: PSR-12 + konvensi Laravel (PascalCase class, camelCase method)
- **JavaScript**: ES Modules, `window.*` untuk fungsi yang dipakai antar file
- **CSS**: Tailwind v4 utility-first + custom CSS variables untuk dark theme
- **Blade**: `@extends`, `@include`, `@stack('scripts')` untuk JS per halaman

## 2. Arsitektur Router

**JANGAN** memanggil `RouterosAPI` langsung dari Controller.
Semua komunikasi ke router HARUS lewat `App\Services\MikrotikService`:

```php
// ✅ BENAR
$mikrotik = new MikrotikService;
$result = $mikrotik->query('/ip/dhcp-server/lease/print');

// ❌ SALAH
$api = new RouterosAPI;
$api->connect($host, $user, $pass);
$result = $api->comm('/ip/dhcp-server/lease/print');
```

### CRUD Pattern di MikrotikService

| Method | Fungsi |
|--------|--------|
| `query()` | Read-only — GET data dari cache/router |
| `execute()` | Write — INSERT/UPDATE/DELETE ke router |
| `addDhcpLease()` | Helper spesifik untuk DHCP lease |
| `updateDhcpLease()` | Helper update DHCP lease |
| `deleteDhcpLease()` | Helper delete DHCP lease |
| `isolateIp()` / `unisolateIp()` | IP Isolation via firewall rule |

Filter parameter:
- `add` → pakai `!empty()` untuk cek field opsional
- `set` (update) → pakai `isset()` untuk update parsial

## 3. Daemon Rules

Daemon (`MikrotikMonitor`) adalah proses long-running dengan koneksi TCP persisten:

- **JANGAN** ubah pola daemon menjadi connect-per-request
- **JANGAN** tambah query berat di fast cycle (2s) — letakkan di slow cycle (10s)
- **WAJIB** handle exception — jangan sampai daemon crash karena satu error
- **WAJIB** preserve stale cache — jangan overwrite cache dengan data kosong saat error
- `fetchData()` return `false` on failure → caller decide to keep stale cache

## 4. Frontend Modal Pattern

Semua modal menggunakan class `.show` untuk visibility (BUKAN `.active`):

```javascript
// ✅ BENAR
modal.classList.add('show');
modal.classList.remove('show');

// ❌ SALAH
modal.classList.add('active');
```

CSS sudah handle kedua class, tapi JS harus konsisten pakai `.show`.

### Utility Functions

```javascript
// ✅ PAKAI INI (dari app.js, exposed via window)
window.escapeHtml(text)      // Escaping HTML entities
window.getCsrfToken()        // Ambil CSRF token dari meta tag
window.showConfirm(msg, action)  // Dialog konfirmasi dinamis

// ❌ JANGAN
function esc(str) { /* manual regex */ }
document.querySelector('meta[name="csrf-token"]').getAttribute('content')
```

### Loading State

Setiap form submit WAJIB disable button + ganti teks jadi "Menyimpan...":

```javascript
async function saveCrud(url, method, data, callback, btn) {
    if (btn) {
        btn.disabled = true;
        btn._origText = btn.textContent;
        btn.textContent = 'Menyimpan...';
    }
    try {
        // ... fetch ...
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = btn._origText || 'Simpan';
        }
    }
}
```

## 5. Billing (Eloquent)

- Selalu gunakan Eloquent Model + relasi, jangan query manual DB
- Model: `Package`, `Customer`, `Invoice`, `Payment`, `PppoeAccount`, `Router`, `AuditLog`
- Relasi: `Customer hasMany PppoeAccount`, `Invoice belongsTo Customer`, dll
- Pagination: `Model::paginate(25)` + `?all=true` untuk tanpa pagination

### Audit Log

**WAJIB** untuk setiap operasi yang memodifikasi data:

```php
AuditLog::create([
    'action' => 'customer_created',
    'entity_type' => 'customer',
    'entity_id' => $customer->id,
    'description' => "Pelanggan {$customer->name} dibuat",
    'old_values' => $oldValues,  // null untuk create
    'new_values' => $newValues,
    'user_id' => Auth::id(),
]);
```

Daftar action yang wajib di-log:
- `*_created` — semua create entity
- `*_updated` — update dengan value diff (`getChanges()`)
- `*_deleted` — delete dengan old values
- `payment_recorded` — pembayaran masuk

## 6. Environment

- **JANGAN** hardcode kredensial router — selalu via `.env`
- **JANGAN** commit `.env` atau database SQLite ke repo
- Konfigurasi MikroTik dibaca dari `config/mikrotik.php` yang read `env()`

```
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=yourpassword
```

## 7. Formatting & Testing

```bash
# Format kode sebelum commit
./vendor/bin/pint

# Jalankan test
php artisan test
```

- Test yang menyentuh `MikrotikService`/`RouterosAPI` WAJIB di-mock
- Jangan hit router asli di CI/testing
- Test billing logic (invoice, payment, status) karena sensitif terhadap uang

## 8. Struktur Project

```
app/
├── Console/Commands/
│   ├── MikrotikMonitor.php        # Daemon polling loop
│   ├── BillingSyncPppoe.php       # CLI: sync all PPPoE
│   ├── BillingCheckOverdue.php    # CLI: overdue isolation
│   └── BillingGenerateInvoices.php # CLI: auto-invoice
├── Http/Controllers/
│   ├── AuthController.php         # Login/logout
│   ├── MikrotikController.php     # Monitoring endpoints
│   └── BillingController.php      # Billing endpoints
├── Jobs/
│   ├── SyncPppoeToRouter.php      # Queue: sync PPPoE
│   ├── CheckOverdueAccounts.php   # Queue: overdue check
│   ├── GenerateInvoices.php       # Queue: auto-invoice
│   └── ActivateCustomer.php       # Queue: reactivate
├── Models/
│   ├── Package, Customer, Invoice, Payment
│   ├── PppoeAccount, Router, AuditLog, User
└── Services/
    ├── RouterosAPI.php            # TCP socket client
    ├── MikrotikService.php        # High-level wrapper
    └── PppoeSyncService.php       # PPPoE sync logic
resources/
├── views/ (layouts, components, pages, billing/*)
├── js/ (app.js, billing.js)
└── css/ (app.css)
routes/
├── web.php                       # All web + API routes
└── console.php                   # Artisan commands
```

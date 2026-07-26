# API Reference

Base URL: `http://localhost:8000/api`

Semua endpoint memerlukan autentikasi (session-based) kecuali `/health` dan `/daemon-status`.

---

## Public

### GET /api/health

Cek status daemon dan cache.

**Response:**
```json
{
    "status": "ok",
    "daemon": {
        "lastRun": "2026-07-26T10:45:31+00:00",
        "connected": true,
        "error": null
    },
    "cache": {
        "resource": true,
        "interfaces": true,
        "dhcp": true,
        "routes": true,
        "firewallFilter": true,
        "firewallNat": true,
        "arp": true,
        "logs": true
    }
}
```

### GET /api/daemon-status

Cek apakah daemon polling berjalan.

**Response:**
```json
{
    "success": true,
    "data": {
        "running": true,
        "lastRun": "2026-07-26T10:45:31+00:00",
        "error": null,
        "healthy": true
    }
}
```

---

## Monitoring (read from cache)

Semua endpoint ini membaca dari Laravel Cache, bukan dari router langsung.

### GET /api/router

Data resource sistem router (CPU, RAM, uptime, dll).

```json
{
    "success": true,
    "data": {
        "cpuLoad": "15",
        "totalMemory": "536870912",
        "freeMemory": "402653184",
        "totalHddSpace": "8388608",
        "freeHddSpace": "4194304",
        "uptime": "2w1d12h30m15s",
        "version": "7.14.3",
        "boardName": "RB750Gr3",
        "architectureName": "mips-be",
        "cpu": "MIPS 24Kc V7.4",
        "cpuCount": "1",
        "cpuFrequency": "650"
    }
}
```

### GET /api/identity

Router identity / nama router.

```json
{
    "success": true,
    "data": {
        "name": "MikroTik-Office",
        "version": "7.14.3"
    }
}
```

### GET /api/interfaces

Semua interface.

```json
{
    "success": true,
    "data": [
        {
            "name": "ether1",
            "type": "ether",
            "running": "true",
            "macAddress": "00:11:22:33:44:55",
            "txByte": "1024000",
            "rxByte": "2048000",
            "mtu": "1500",
            "disabled": "false"
        }
    ]
}
```

### GET /api/interface/{name}

Detail satu interface.

### GET /api/traffic/{name}

History traffic (60 data points, rate dalam bytes/detik).

```json
{
    "success": true,
    "data": [
        { "ts": 1721980800000, "rxRate": 1024000, "txRate": 512000 },
        { "ts": 1721980820000, "rxRate": 2048000, "txRate": 256000 }
    ]
}
```

### GET /api/dhcp-leases

DHCP lease list.

### GET /api/routes

Routing table.

### GET /api/firewall/filter

Firewall filter rules.

### GET /api/firewall/nat

Firewall NAT rules.

### GET /api/ip-addresses

IP addresses pada router.

### GET /api/arp

ARP table.

### GET /api/logs

System logs (last 50 entries).

### GET /api/hotspot/active

Active hotspot users.

### GET /api/dns

DNS configuration.

### GET /api/isolated-ips

Daftar IP yang sedang diisolasi.

```json
{
    "success": true,
    "data": ["192.168.1.100", "192.168.1.101"]
}
```

---

## Monitoring CRUD (writes to router)

Endpoint ini menulis **langsung ke router** via koneksi terpisah (bukan daemon).

### DHCP Leases

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/dhcp-leases` | Tambah lease baru |
| PUT | `/api/dhcp-leases/{id}` | Update lease (id = `.id` dari RouterOS) |
| DELETE | `/api/dhcp-leases/{id}` | Hapus lease |

**POST /api/dhcp-leases**
```json
{
    "address": "192.168.1.100",
    "mac-address": "00:11:22:33:44:55",
    "server": "dhcp1",
    "comment": "User A"
}
```

### Firewall Filter

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/firewall/filter` | Tambah rule filter |
| PUT | `/api/firewall/filter/{id}` | Update rule filter |
| DELETE | `/api/firewall/filter/{id}` | Hapus rule filter |

### Firewall NAT

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/firewall/nat` | Tambah rule NAT |
| PUT | `/api/firewall/nat/{id}` | Update rule NAT |
| DELETE | `/api/firewall/nat/{id}` | Hapus rule NAT |

### IP Addresses

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/ip-addresses` | Tambah IP address |
| PUT | `/api/ip-addresses/{id}` | Update IP address |
| DELETE | `/api/ip-addresses/{id}` | Hapus IP address |

### IP Isolation

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/isolate-ip` | Blokir akses internet untuk IP |
| POST | `/api/unisolate-ip` | Buka blokir IP |

**POST /api/isolate-ip**
```json
{
    "ip": "192.168.1.100"
}
```
```json
{
    "success": true,
    "message": "IP 192.168.1.100 telah diisolasi"
}
```

---

## Billing API

Semua endpoint billing membaca/menulis ke database (MySQL/SQLite).

### GET /api/billing/dashboard

Statistik billing untuk dashboard utama.

```json
{
    "success": true,
    "data": {
        "activeCustomers": 42,
        "isolatedCustomers": 3,
        "totalCustomers": 50,
        "monthlyRevenue": 25000000,
        "pendingRevenue": 5000000,
        "recentPayments": [
            {
                "id": 1,
                "amount": 500000,
                "payment_method": "transfer",
                "paid_at": "2026-07-26T10:00:00+00:00",
                "invoice": {
                    "invoice_number": "INV-2026-0001",
                    "customer": { "name": "Budi" }
                }
            }
        ],
        "monthlyData": { "1": 20000000, "2": 25000000, "3": 30000000 }
    }
}
```

### Packages

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/packages` | List (paginated). `?all=true` untuk semua |
| POST | `/api/packages` | Tambah paket |
| PUT | `/api/packages/{id}` | Update paket |
| DELETE | `/api/packages/{id}` | Hapus paket |

**POST /api/packages**
```json
{
    "name": "Paket 10 Mbps",
    "price": 150000,
    "speed": "10M/10M",
    "description": "Fiber 10 Mbps",
    "billing_period": "monthly"
}
```

### Customers

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/customers` | List (paginated). `?all=true` untuk semua |
| POST | `/api/customers` | Tambah pelanggan |
| PUT | `/api/customers/{id}` | Update pelanggan |
| DELETE | `/api/customers/{id}` | Hapus pelanggan |

**POST /api/customers**
```json
{
    "name": "Budi",
    "phone": "08123456789",
    "address": "Jl. Merdeka No.1",
    "pppoe_username": "budi",
    "pppoe_password": "rahasia123",
    "package_id": 1,
    "status": "active"
}
```

### Invoices

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invoices` | List (paginated). `?all=true` untuk semua |
| POST | `/api/invoices` | Buat tagihan |
| PUT | `/api/invoices/{id}` | Update tagihan |
| DELETE | `/api/invoices/{id}` | Hapus tagihan |

**POST /api/invoices**
```json
{
    "customer_id": 1,
    "invoice_number": "INV-2026-0001",
    "amount": 150000,
    "status": "unpaid",
    "due_date": "2026-08-26",
    "period_start": "2026-07-01",
    "period_end": "2026-07-31"
}
```

### Payments

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/payments` | List (paginated). `?all=true` untuk semua |
| POST | `/api/payments` | Catat pembayaran |
| DELETE | `/api/payments/{id}` | Hapus pembayaran |

**POST /api/payments**
```json
{
    "invoice_id": 1,
    "amount": 150000,
    "payment_method": "transfer",
    "reference": "TRF-001",
    "notes": "Pembayaran Juli"
}
```

### Routers

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/routers` | List (paginated). `?all=true` untuk semua |
| POST | `/api/routers` | Tambah router |
| PUT | `/api/routers/{id}` | Update router |
| DELETE | `/api/routers/{id}` | Hapus router |

**POST /api/routers**
```json
{
    "name": "Router Office",
    "host": "192.168.88.1",
    "port": 8728,
    "username": "admin",
    "password": "rahasia",
    "is_active": true
}
```

### PPPoE Accounts

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/pppoe-accounts` | List (paginated). `?all=true` untuk semua |
| POST | `/api/pppoe-accounts` | Tambah akun PPPoE |
| PUT | `/api/pppoe-accounts/{id}` | Update akun PPPoE |
| DELETE | `/api/pppoe-accounts/{id}` | Hapus akun PPPoE |
| POST | `/api/pppoe-accounts/{id}/sync` | Sync akun ke router via queue job |

**POST /api/pppoe-accounts**
```json
{
    "customer_id": 1,
    "router_id": 1,
    "username": "budi",
    "password": "rahasia123",
    "profile": "10Mbps",
    "ip_address": "192.168.10.1",
    "disabled": false
}
```

### Audit Logs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/audit-logs` | List (paginated). `?all=true` untuk semua |

---

## Catatan

- **Pagination**: Default 25 items/page. Gunakan `?page=2` untuk halaman berikutnya.
- **All records**: Tambahkan `?all=true` untuk bypass pagination.
- **CSRF**: Semua mutasi (POST/PUT/DELETE) perlu header `X-CSRF-TOKEN`.
- **Response format**: Semua sukses → `{ "success": true, "data": ... }`. Error → `{ "success": false, "error": "pesan" }`.
- **HTTP codes**: 200 sukses, 422 validation error, 404 not found, 500 server error.

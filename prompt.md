# TUGAS: Audit Repo + Rancang Sistem Billing PPPoE

Kamu sedang bekerja di repo lokal hasil clone dari:
https://github.com/Ballon14/mikrotik-laravel.git

Tujuan akhir: menjadikan repo ini sebagai fondasi **Sistem Billing PPPoE** 
terintegrasi Mikrotik (bukan sekadar wrapper API RouterOS).

## TAHAP 1 — AUDIT REPO (lakukan dan laporkan sebelum menulis kode apa pun)

1. Jelajahi seluruh struktur folder (`app/`, `routes/`, `database/migrations/`, 
   `config/`, `resources/`, dll). Tampilkan struktur dalam bentuk tree.
2. Identifikasi:
   - Versi Laravel & PHP yang dipakai (cek composer.json)
   - Package Mikrotik API yang digunakan (nama package, versi, dependency)
   - Fitur yang SUDAH ada (misal: koneksi API Mikrotik, manajemen PPPoE secret, 
     hotspot, queue, monitoring)
   - Struktur database yang sudah ada (migration files) — model, tabel, relasi
   - Autentikasi yang dipakai (Breeze/Jetstream/Sanctum/manual)
   - Ada tidaknya sistem role/permission
   - Konfigurasi koneksi Mikrotik (.env, config file)
3. Cek kualitas kode:
   - Ada test (unit/feature) atau tidak
   - Ada validasi input di controller/request
   - Ada exception handling untuk koneksi ke Mikrotik (timeout, gagal konek, dll)
   - Potensi security issue (kredensial Mikrotik disimpan plaintext? API key 
     hardcoded? rate limiting untuk login?)
   - Konsistensi penamaan (naming convention), duplikasi kode
4. Cek dependency: apakah ada package yang outdated/vulnerable 
   (`composer outdated`, cek advisory jika bisa)
5. Ringkas semua temuan di atas dalam format laporan audit (poin per poin, 
   sertakan file/line reference), lalu **tunggu konfirmasi saya sebelum lanjut 
   ke Tahap 2**.

## TAHAP 2 — RANCANGAN SISTEM BILLING PPPoE (setelah audit disetujui)

Bangun fitur billing di atas fondasi repo yang ada, dengan cakupan:

### Database (buat migration baru, jangan ubah struktur lama tanpa alasan)
- `customers` — data pelanggan (nama, alamat, no. HP, email, NIK, status)
- `pppoe_accounts` — username/password PPPoE, profile, IP, relasi ke customer 
  dan ke router (jika multi-router)
- `packages` — nama paket, kecepatan up/down, harga, jenis billing (bulanan/dll)
- `invoices` — no invoice, periode, jumlah, status, jatuh tempo, relasi ke customer
- `payments` — metode, referensi, nominal, invoice terkait, waktu bayar
- `routers` — jika mendukung multi-mikrotik (host, user, pass terenkripsi, port)

### Fitur Backend
- Sinkronisasi otomatis PPPoE secret di Mikrotik saat customer baru dibuat/diubah
- Job/Scheduler (Laravel Task Scheduling) untuk:
  - Generate invoice otomatis tiap periode
  - Cek status pembayaran H-3 sebelum jatuh tempo → kirim reminder
  - Auto isolir (ubah profile PPPoE ke "isolir") saat lewat jatuh tempo
  - Auto aktifkan kembali saat pembayaran dikonfirmasi
- Enkripsi kredensial router (jangan simpan password Mikrotik plaintext — 
  pakai Laravel encrypted cast)
- API/Service layer terpisah untuk komunikasi Mikrotik (jangan taruh logic 
  RouterOS API langsung di controller)
- Notifikasi (WhatsApp Gateway/Email) untuk reminder & konfirmasi pembayaran
- Dashboard admin: jumlah pelanggan aktif/isolir, pendapatan bulanan, grafik

### Non-fungsional
- Validasi request pakai Form Request class
- Queue untuk proses yang berat (sinkron Mikrotik, kirim notifikasi)
- Logging semua aksi yang mengubah status PPPoE di router (audit trail)
- Unit test untuk logic billing (kalkulasi invoice, cek jatuh tempo)

## ATURAN KERJA
- Kerjakan bertahap, satu fitur/migration per commit
- Jangan hapus atau timpa fitur existing yang sudah berjalan tanpa konfirmasi
- Ikuti konvensi kode yang sudah ada di repo (jika ada Pint/PSR-12, ikuti)
- Setelah tiap tahap, jalankan test yang ada (jika ada) untuk pastikan tidak 
  ada regresi

Mulai dari TAHAP 1 sekarang.

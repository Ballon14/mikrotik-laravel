<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="MikroTik Router Billing & Monitoring Dashboard — Real-time system monitoring, PPPoE billing, interfaces, DHCP, firewall, and more.">
    <meta name="theme-color" content="#0a0e1a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MikroTik">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="MikroTik Billing & Monitor">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='%2322d3ee' stroke-width='2'><path d='m12 14 4-4'/><path d='M4 20v-8a8 8 0 0 1 16 0v8'/><path d='M4 20h16'/><path d='M4 14h16'/></svg>">
    <title>MikroTik Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://unpkg.com/lucide@latest"></script>
</head>

<body>

    <!-- Mobile Toggle -->
    <button class="mobile-toggle" id="mobileToggle"><i data-lucide="menu"></i></button>
    <div class="mobile-overlay" id="mobileOverlay"></div>

    <div class="app-layout">
        <!-- Sidebar Component -->
        @include('components.sidebar')

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header Component -->
            @include('components.header')

            <!-- Section Content -->
            <div class="page-content">
                @yield('content')
            </div>
        </main>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast"></div>

    <!-- Confirm Modal (shared across all pages) -->
    <div class="confirm-modal" id="confirmModal">
        <div class="confirm-modal-content">
            <i data-lucide="alert-triangle" style="width:40px;height:40px;color:#fbbf24;margin-bottom:12px;"></i>
            <h3 id="confirmModalTitle">Konfirmasi</h3>
            <p id="confirmMessage">Apakah Anda yakin?</p>
            <div class="confirm-actions">
                <button class="btn-cancel" id="confirmCancel">Batal</button>
                <button class="btn-delete" id="confirmDelete">Hapus</button>
            </div>
        </div>
    </div>

    @stack('scripts')
    <script>lucide.createIcons();</script>
</body>
</html>

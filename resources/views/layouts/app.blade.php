<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="MikroTik Router Monitoring Dashboard — Real-time system monitoring, interfaces, DHCP, firewall, and more.">
    <title>MikroTik Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='%2322d3ee' stroke-width='2'><path d='m12 14 4-4'/><path d='M4 20v-8a8 8 0 0 1 16 0v8'/><path d='M4 20h16'/><path d='M4 14h16'/></svg>">
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

    <script>lucide.createIcons();</script>
</body>
</html>

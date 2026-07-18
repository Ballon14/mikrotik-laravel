<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MikroTik Router Monitoring Dashboard — Real-time system monitoring, interfaces, DHCP, firewall, and more.">
    <title>MikroTik Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📡</text></svg>">
</head>

<body>

    <!-- Mobile Toggle -->
    <button class="mobile-toggle" id="mobileToggle">☰</button>
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

</body>
</html>

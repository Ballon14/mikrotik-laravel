<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-logo">
            <div class="sidebar-logo-icon">📡</div>
            <div class="sidebar-logo-text">
                <h1>MikroTik</h1>
                <span>Dashboard Monitor</span>
            </div>
        </div>
    </div>

    <!-- Connection Status -->
    <div class="connection-status disconnected" id="connectionStatus">
        <div class="status-dot"></div>
        <div class="status-info">
            <span class="label">Router</span>
            <span class="value" id="routerNameDisplay">Connecting...</span>
        </div>
    </div>

    @php
        $counts = [
            'interfaces' => count(Cache::get('mikrotik_data_interfaces', [])) ?: '-',
            'dhcp' => count(Cache::get('mikrotik_data_dhcp', [])) ?: '-',
            'arp' => count(Cache::get('mikrotik_data_arp', [])) ?: '-',
            'routes' => count(Cache::get('mikrotik_data_routes', [])) ?: '-',
            'hotspot' => count(Cache::get('mikrotik_data_wireless', [])) ?: '-',
            'ip_addresses' => count(Cache::get('mikrotik_data_ip_addresses', [])) ?: '-',
            'isolated' => count(Cache::get('mikrotik_data_isolated_ips', [])) ?: '0',
        ];
    @endphp

    <!-- Navigation -->
    <nav class="sidebar-nav">
        <div class="nav-section-title">Monitoring</div>
        
        <a href="/" class="nav-item {{ request()->is('/') ? 'active' : '' }}">
            <span class="nav-item-icon">📊</span>
            <span>System Overview</span>
        </a>
        
        <a href="/interfaces" class="nav-item {{ request()->is('interfaces') ? 'active' : '' }}" data-section="interfaces">
            <span class="nav-item-icon">🔌</span>
            <span>Interfaces</span>
            <span class="nav-item-badge">{{ $counts['interfaces'] }}</span>
        </a>
        
        <a href="/dhcp" class="nav-item {{ request()->is('dhcp') ? 'active' : '' }}" data-section="dhcp">
            <span class="nav-item-icon">📋</span>
            <span>DHCP Leases</span>
            <span class="nav-item-badge">{{ $counts['dhcp'] }}</span>
        </a>
        
        <a href="/arp" class="nav-item {{ request()->is('arp') ? 'active' : '' }}" data-section="arp">
            <span class="nav-item-icon">📡</span>
            <span>ARP Table</span>
            <span class="nav-item-badge">{{ $counts['arp'] }}</span>
        </a>

        <div class="nav-section-title">Network</div>
        
        <a href="/ip-addresses" class="nav-item {{ request()->is('ip-addresses') ? 'active' : '' }}" data-section="ip-addresses">
            <span class="nav-item-icon">🌐</span>
            <span>IP Addresses</span>
            <span class="nav-item-badge">{{ $counts['ip_addresses'] }}</span>
        </a>
        
        <a href="/routes" class="nav-item {{ request()->is('routes') ? 'active' : '' }}" data-section="routes">
            <span class="nav-item-icon">🗺️</span>
            <span>Routing Table</span>
            <span class="nav-item-badge">{{ $counts['routes'] }}</span>
        </a>
        
        <a href="/firewall" class="nav-item {{ request()->is('firewall') ? 'active' : '' }}" data-section="firewall">
            <span class="nav-item-icon">🛡️</span>
            <span>Firewall Rules</span>
        </a>
        
        <a href="/ip-isolation" class="nav-item {{ request()->is('ip-isolation') ? 'active' : '' }}" data-section="ip-isolation">
            <span class="nav-item-icon">🔒</span>
            <span>IP Isolation</span>
            @if($counts['isolated'] !== '0')
                <span class="nav-item-badge badge-danger">{{ $counts['isolated'] }}</span>
            @endif
        </a>

        <div class="nav-section-title">Services</div>
        
        <a href="/hotspot" class="nav-item {{ request()->is('hotspot') ? 'active' : '' }}" data-section="hotspot">
            <span class="nav-item-icon">📶</span>
            <span>Hotspot Active</span>
            <span class="nav-item-badge">{{ $counts['hotspot'] }}</span>
        </a>
        
        <a href="/logs" class="nav-item {{ request()->is('logs') ? 'active' : '' }}" data-section="logs">
            <span class="nav-item-icon">📜</span>
            <span>System Logs</span>
        </a>
        <div class="nav-section-title">Billing System</div>
        
        <a href="/packages" class="nav-item {{ request()->is('packages') ? 'active' : '' }}" data-section="packages">
            <span class="nav-item-icon">💳</span>
            <span>Packages</span>
        </a>

        <a href="/customers" class="nav-item {{ request()->is('customers') ? 'active' : '' }}" data-section="customers">
            <span class="nav-item-icon">👥</span>
            <span>Customers</span>
        </a>

        <a href="/invoices" class="nav-item {{ request()->is('invoices') ? 'active' : '' }}" data-section="invoices">
            <span class="nav-item-icon">🧾</span>
            <span>Invoices</span>
        </a>
    </nav>

    <div class="sidebar-footer" style="flex-direction: column; align-items: flex-start; gap: 10px;">
        <div style="display: flex; justify-content: space-between; width: 100%;">
            <div class="refresh-indicator">
                <div class="refresh-spinner" id="refreshSpinner"></div>
                <span>Auto-refresh</span>
            </div>
            <span>v1.2</span>
        </div>
        
        <form action="{{ route('logout') }}" method="POST" style="width: 100%;">
            @csrf
            <button type="submit" class="nav-item" style="width: 100%; border: none; background: rgba(248, 113, 113, 0.1); color: var(--accent-red); margin-top: 5px; cursor: pointer;">
                <span class="nav-item-icon">🚪</span>
                <span>Logout</span>
            </button>
        </form>
    </div>
</aside>

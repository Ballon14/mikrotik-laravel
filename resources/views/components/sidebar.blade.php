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
        
        <a href="/routes" class="nav-item {{ request()->is('routes') ? 'active' : '' }}" data-section="routes">
            <span class="nav-item-icon">🗺️</span>
            <span>Routing Table</span>
            <span class="nav-item-badge">{{ $counts['routes'] }}</span>
        </a>
        
        <a href="/firewall" class="nav-item {{ request()->is('firewall') ? 'active' : '' }}" data-section="firewall">
            <span class="nav-item-icon">🛡️</span>
            <span>Firewall Rules</span>
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
    </nav>

    <div class="sidebar-footer">
        <div class="refresh-indicator">
            <div class="refresh-spinner" id="refreshSpinner"></div>
            <span>Auto-refresh 5s</span>
        </div>
        <span>v1.0</span>
    </div>
</aside>

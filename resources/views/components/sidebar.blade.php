<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-logo">
            <div class="sidebar-logo-icon"><i data-lucide="radio" style="width:22px;height:22px;stroke-width:2.5;"></i></div>
            <div class="sidebar-logo-text">
                <h1>MikroTik</h1>
                <span>Billing & Monitor</span>
            </div>
        </div>
    </div>

    <div class="connection-status disconnected" id="connectionStatus">
        <div class="status-dot"></div>
        <div class="status-info">
            <span class="label">Router</span>
            <span class="value" id="routerNameDisplay">Connecting...</span>
        </div>
    </div>

    @php
        $fwFilter = Cache::get('mikrotik_data_fw_filter', []);
        $fwNat = Cache::get('mikrotik_data_fw_nat', []);
        $counts = [
            'interfaces' => count(Cache::get('mikrotik_data_interfaces', [])) ?: '-',
            'dhcp' => count(Cache::get('mikrotik_data_dhcp', [])) ?: '-',
            'arp' => count(Cache::get('mikrotik_data_arp', [])) ?: '-',
            'routes' => count(Cache::get('mikrotik_data_routes', [])) ?: '-',
            'hotspot' => count(Cache::get('mikrotik_data_hotspot_active', [])) ?: '-',
            'ip_addresses' => count(Cache::get('mikrotik_data_ip_addresses', [])) ?: '-',
            'firewall' => count($fwFilter) + count($fwNat) ?: '-',
            'isolated' => count(Cache::get('mikrotik_data_isolated_ips', [])) ?: '-',
        ];
    @endphp

    <nav class="sidebar-nav">
        <div class="nav-section-title">Billing System</div>

        <a href="/" class="nav-item {{ request()->is('/') ? 'active' : '' }}" data-section="billing-dashboard">
            <i data-lucide="bar-chart-3" class="nav-item-icon"></i>
            <span>Billing Dashboard</span>
        </a>

        <a href="/packages" class="nav-item {{ request()->is('packages') ? 'active' : '' }}" data-section="packages">
            <i data-lucide="credit-card" class="nav-item-icon"></i>
            <span>Packages</span>
        </a>

        <a href="/customers" class="nav-item {{ request()->is('customers') ? 'active' : '' }}" data-section="customers">
            <i data-lucide="users" class="nav-item-icon"></i>
            <span>Customers</span>
        </a>

        <a href="/invoices" class="nav-item {{ request()->is('invoices') ? 'active' : '' }}" data-section="invoices">
            <i data-lucide="receipt" class="nav-item-icon"></i>
            <span>Invoices</span>
        </a>

        <a href="/payments" class="nav-item {{ request()->is('payments') ? 'active' : '' }}" data-section="payments">
            <i data-lucide="wallet" class="nav-item-icon"></i>
            <span>Payments</span>
        </a>

        <a href="/pppoe-accounts" class="nav-item {{ request()->is('pppoe-accounts') ? 'active' : '' }}" data-section="pppoe-accounts">
            <i data-lucide="cable" class="nav-item-icon"></i>
            <span>PPPoE Accounts</span>
        </a>

        <a href="/routers" class="nav-item {{ request()->is('routers') ? 'active' : '' }}" data-section="routers">
            <i data-lucide="server" class="nav-item-icon"></i>
            <span>Routers</span>
        </a>

        <a href="/audit-logs" class="nav-item {{ request()->is('audit-logs') ? 'active' : '' }}" data-section="audit-logs">
            <i data-lucide="scroll-text" class="nav-item-icon"></i>
            <span>Audit Logs</span>
        </a>

        <div class="nav-section-title">Monitoring</div>

        <a href="/monitoring" class="nav-item {{ request()->is('monitoring') ? 'active' : '' }}" data-section="overview">
            <i data-lucide="layout-dashboard" class="nav-item-icon"></i>
            <span>System Overview</span>
        </a>

        <a href="/interfaces" class="nav-item {{ request()->is('interfaces') ? 'active' : '' }}" data-section="interfaces">
            <i data-lucide="ethernet-port" class="nav-item-icon"></i>
            <span>Interfaces</span>
            <span class="nav-item-badge">{{ $counts['interfaces'] }}</span>
        </a>

        <a href="/dhcp" class="nav-item {{ request()->is('dhcp') ? 'active' : '' }}" data-section="dhcp">
            <i data-lucide="list" class="nav-item-icon"></i>
            <span>DHCP Leases</span>
            <span class="nav-item-badge">{{ $counts['dhcp'] }}</span>
        </a>

        <a href="/arp" class="nav-item {{ request()->is('arp') ? 'active' : '' }}" data-section="arp">
            <i data-lucide="radio" class="nav-item-icon"></i>
            <span>ARP Table</span>
            <span class="nav-item-badge">{{ $counts['arp'] }}</span>
        </a>

        <div class="nav-section-title">Network</div>

        <a href="/ip-addresses" class="nav-item {{ request()->is('ip-addresses') ? 'active' : '' }}" data-section="ip-addresses">
            <i data-lucide="globe" class="nav-item-icon"></i>
            <span>IP Addresses</span>
            <span class="nav-item-badge">{{ $counts['ip_addresses'] }}</span>
        </a>

        <a href="/routes" class="nav-item {{ request()->is('routes') ? 'active' : '' }}" data-section="routes">
            <i data-lucide="map" class="nav-item-icon"></i>
            <span>Routing Table</span>
            <span class="nav-item-badge">{{ $counts['routes'] }}</span>
        </a>

        <a href="/firewall" class="nav-item {{ request()->is('firewall') ? 'active' : '' }}" data-section="firewall">
            <i data-lucide="shield" class="nav-item-icon"></i>
            <span>Firewall Rules</span>
            <span class="nav-item-badge">{{ $counts['firewall'] }}</span>
        </a>

        <a href="/ip-isolation" class="nav-item {{ request()->is('ip-isolation') ? 'active' : '' }}" data-section="ip-isolation">
            <i data-lucide="lock" class="nav-item-icon"></i>
            <span>IP Isolation</span>
            @if($counts['isolated'] !== '-')
                <span class="nav-item-badge badge-danger">{{ $counts['isolated'] }}</span>
            @endif
        </a>

        <div class="nav-section-title">Services</div>

        <a href="/hotspot" class="nav-item {{ request()->is('hotspot') ? 'active' : '' }}" data-section="hotspot">
            <i data-lucide="wifi" class="nav-item-icon"></i>
            <span>Hotspot Active</span>
            <span class="nav-item-badge">{{ $counts['hotspot'] }}</span>
        </a>

        <a href="/logs" class="nav-item {{ request()->is('logs') ? 'active' : '' }}" data-section="logs">
            <i data-lucide="file-text" class="nav-item-icon"></i>
            <span>System Logs</span>
        </a>
    </nav>

    <div class="sidebar-footer">
        <div class="sidebar-footer-row">
            <div class="refresh-indicator">
                <div class="refresh-spinner" id="refreshSpinner"></div>
                <span>Auto-refresh</span>
            </div>
            <span>v1.2</span>
        </div>

        <form action="{{ route('logout') }}" method="POST" id="logoutForm">
            @csrf
            <button type="submit" class="sidebar-logout-btn" id="logoutBtn">
                <i data-lucide="log-out"></i>
                <span id="logoutBtnText">Logout</span>
            </button>
        </form>
    </div>
</aside>

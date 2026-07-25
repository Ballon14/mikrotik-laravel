@extends('layouts.app')

@section('title', 'System Overview')

@section('content')
<div class="daemon-banner" id="daemonBanner" style="display:none;">
    <i data-lucide="alert-triangle" style="width:16px;height:16px;flex-shrink:0;"></i>
    <span id="daemonBannerText">Memuat data...</span>
</div>

<div class="stats-grid">
    <div class="stat-card cyan" id="statCardCpu">
        <div class="stat-card-top">
            <span class="stat-label">CPU Load</span>
            <i data-lucide="cpu" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="cpuValue">-</div>
        <div class="progress-bar">
            <div class="progress-fill green" id="cpuProgress" style="width:0%"></div>
        </div>
    </div>

    <div class="stat-card green" id="statCardRam">
        <div class="stat-card-top">
            <span class="stat-label">RAM Usage</span>
            <i data-lucide="memory-stick" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="ramValue">-</div>
        <div class="stat-sub" id="ramSub">- / -</div>
        <div class="progress-bar">
            <div class="progress-fill green" id="ramProgress" style="width:0%"></div>
        </div>
    </div>

    <div class="stat-card purple" id="statCardHdd">
        <div class="stat-card-top">
            <span class="stat-label">Storage</span>
            <i data-lucide="hard-drive" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="hddValue">-</div>
        <div class="stat-sub" id="hddSub">- / -</div>
    </div>

    <div class="stat-card blue" id="statCardUptime">
        <div class="stat-card-top">
            <span class="stat-label">Uptime</span>
            <i data-lucide="clock" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value stat-value-small" id="uptimeValue">-</div>
    </div>
</div>

<div class="quick-stats" id="quickStats" style="display:none;">
    <div class="quick-stat-item"><i data-lucide="ethernet-port" style="width:13px;height:13px;"></i> <span id="qsInterfaces">-</span> Interfaces</div>
    <div class="quick-stat-item"><i data-lucide="list" style="width:13px;height:13px;"></i> <span id="qsDhcp">-</span> DHCP</div>
    <div class="quick-stat-item"><i data-lucide="radio" style="width:13px;height:13px;"></i> <span id="qsArp">-</span> ARP</div>
    <div class="quick-stat-item"><i data-lucide="map" style="width:13px;height:13px;"></i> <span id="qsRoutes">-</span> Routes</div>
    <div class="quick-stat-item"><i data-lucide="shield" style="width:13px;height:13px;"></i> <span id="qsFirewall">-</span> Firewall</div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="info" style="width:16px;height:16px;"></i> System Information</h3>
        <span class="last-updated" id="lastUpdated">-</span>
    </div>
    <div class="card-body">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-item-label">Board Name</div>
                <div class="info-item-value" id="infoBoardName">-</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">Architecture</div>
                <div class="info-item-value" id="infoArchitecture">-</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">RouterOS Version</div>
                <div class="info-item-value" id="infoVersion">-</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">CPU Model</div>
                <div class="info-item-value" id="infoCPU">-</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">CPU Count</div>
                <div class="info-item-value" id="infoCPUCount">-</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">CPU Frequency</div>
                <div class="info-item-value" id="infoCPUFreq">-</div>
            </div>
        </div>
    </div>
</div>

<div class="charts-grid">
    <div class="chart-card" id="chartCardUplink">
        <div class="chart-header">
            <h3><i data-lucide="globe" style="width:16px;height:16px;"></i> <span id="chartNameUplink">Uplink</span></h3>
            <span class="chart-status" id="chartStatusUplink">Menunggu data...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapUplink">
                <div class="chart-waiting" id="chartWaitUplink">
                    <i data-lucide="loader-2" class="icon-spin"></i>
                    <span>Mengumpulkan data traffic...</span>
                </div>
            </div>
        </div>
        <div class="chart-legend">
            <div class="chart-legend-item">
                <span class="chart-legend-dot rx"></span>
                <span class="chart-legend-label">RX (Download):</span>
                <span class="chart-legend-value" id="legendRxUplink">-</span>
            </div>
            <div class="chart-legend-item">
                <span class="chart-legend-dot tx"></span>
                <span class="chart-legend-label">TX (Upload):</span>
                <span class="chart-legend-value" id="legendTxUplink">-</span>
            </div>
        </div>
    </div>

    <div class="chart-card" id="chartCardBridge">
        <div class="chart-header">
            <h3><i data-lucide="network" style="width:16px;height:16px;"></i> <span id="chartNameBridge">Bridge</span></h3>
            <span class="chart-status" id="chartStatusBridge">Menunggu data...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapBridge">
                <div class="chart-waiting" id="chartWaitBridge">
                    <i data-lucide="loader-2" class="icon-spin"></i>
                    <span>Mengumpulkan data traffic...</span>
                </div>
            </div>
        </div>
        <div class="chart-legend">
            <div class="chart-legend-item">
                <span class="chart-legend-dot rx"></span>
                <span class="chart-legend-label">RX (Download):</span>
                <span class="chart-legend-value" id="legendRxBridge">-</span>
            </div>
            <div class="chart-legend-item">
                <span class="chart-legend-dot tx"></span>
                <span class="chart-legend-label">TX (Upload):</span>
                <span class="chart-legend-value" id="legendTxBridge">-</span>
            </div>
        </div>
    </div>
</div>
@endsection

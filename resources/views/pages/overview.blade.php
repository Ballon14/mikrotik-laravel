@extends('layouts.app')

@section('title', '📊 System Overview')

@section('content')
<!-- Stats Grid -->
<div class="stats-grid">
    <div class="stat-card cyan">
        <div class="stat-card-top">
            <span class="stat-label">CPU Load</span>
            <div class="stat-icon">⚡</div>
        </div>
        <div class="stat-value" id="cpuValue">-</div>
        <div class="progress-bar">
            <div class="progress-fill green" id="cpuProgress" style="width:0%"></div>
        </div>
    </div>

    <div class="stat-card green">
        <div class="stat-card-top">
            <span class="stat-label">RAM Usage</span>
            <div class="stat-icon">🧠</div>
        </div>
        <div class="stat-value" id="ramValue">-</div>
        <div class="stat-sub" id="ramSub">- / -</div>
        <div class="progress-bar">
            <div class="progress-fill green" id="ramProgress" style="width:0%"></div>
        </div>
    </div>

    <div class="stat-card purple">
        <div class="stat-card-top">
            <span class="stat-label">Storage</span>
            <div class="stat-icon">💾</div>
        </div>
        <div class="stat-value" id="hddValue">-</div>
        <div class="stat-sub" id="hddSub">- / -</div>
    </div>

    <div class="stat-card blue">
        <div class="stat-card-top">
            <span class="stat-label">Uptime</span>
            <div class="stat-icon">⏱️</div>
        </div>
        <div class="stat-value" id="uptimeValue" style="font-size:18px;">-</div>
    </div>
</div>

<!-- System Information -->
<div class="card">
    <div class="card-header">
        <h3><span class="icon">ℹ️</span> System Information</h3>
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

<!-- Traffic Charts -->
<div class="charts-grid">
    <div class="chart-card" id="chartCardUplink">
        <div class="chart-header">
            <h3>🌐 ether1-UPLINK-ISP</h3>
            <span class="chart-status" id="chartStatusUplink">Collecting...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapUplink">
                <div class="chart-waiting">
                    <div class="dot-pulse"><span></span><span></span><span></span></div>
                    Mengumpulkan data traffic...
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
            <h3>🌉 bridge1-DISTRIBUSI-SERVER</h3>
            <span class="chart-status" id="chartStatusBridge">Collecting...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapBridge">
                <div class="chart-waiting">
                    <div class="dot-pulse"><span></span><span></span><span></span></div>
                    Mengumpulkan data traffic...
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

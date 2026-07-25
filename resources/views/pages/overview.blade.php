@extends('layouts.app')

@section('title', 'System Overview')

@section('content')
<div class="stats-grid">
    <div class="stat-card cyan">
        <div class="stat-card-top">
            <span class="stat-label">CPU Load</span>
            <i data-lucide="cpu" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="cpuValue">-</div>
        <div class="progress-bar">
            <div class="progress-fill green" id="cpuProgress" style="width:0%"></div>
        </div>
    </div>

    <div class="stat-card green">
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

    <div class="stat-card purple">
        <div class="stat-card-top">
            <span class="stat-label">Storage</span>
            <i data-lucide="hard-drive" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value" id="hddValue">-</div>
        <div class="stat-sub" id="hddSub">- / -</div>
    </div>

    <div class="stat-card blue">
        <div class="stat-card-top">
            <span class="stat-label">Uptime</span>
            <i data-lucide="clock" class="stat-icon-lucide"></i>
        </div>
        <div class="stat-value stat-value-small" id="uptimeValue">-</div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h3><i data-lucide="info" style="width:16px;height:16px;"></i> System Information</h3>
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
            <h3><i data-lucide="globe" style="width:16px;height:16px;"></i> <span id="chartNameUplink">ether1-UPLINK-ISP</span></h3>
            <span class="chart-status" id="chartStatusUplink">Collecting...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapUplink">
                <div class="chart-waiting">
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
            <h3><i data-lucide="network" style="width:16px;height:16px;"></i> <span id="chartNameBridge">bridge1-DISTRIBUSI-SERVER</span></h3>
            <span class="chart-status" id="chartStatusBridge">Collecting...</span>
        </div>
        <div class="chart-body">
            <div class="chart-canvas-wrap" id="chartWrapBridge">
                <div class="chart-waiting">
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

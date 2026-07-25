@extends('layouts.app')

@section('title', 'Hotspot Active')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="wifi" style="width:16px;height:16px;"></i> Hotspot Active Users</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Uptime</th>
                        <th>Download</th>
                        <th>Upload</th>
                    </tr>
                </thead>
                <tbody id="hotspotTable">
                    <tr><td colspan="6"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

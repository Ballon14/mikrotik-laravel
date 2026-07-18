@extends('layouts.app')

@section('title', '📶 Hotspot <span>Active</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">📶</span> Hotspot Active Users</h3>
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
                    <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

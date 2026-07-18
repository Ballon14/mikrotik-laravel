@extends('layouts.app')

@section('title', '📜 System <span>Logs</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">📜</span> System Logs</h3>
        <span style="font-size:11px; color:var(--text-muted);">50 terbaru</span>
    </div>
    <div class="card-body" style="max-height:600px; overflow-y:auto; padding:8px;">
        <div id="logsContainer">
            <div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div>
        </div>
    </div>
</div>
@endsection

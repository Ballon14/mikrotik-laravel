@extends('layouts.app')

@section('title', 'System Logs')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="file-text" style="width:16px;height:16px;"></i> System Logs</h3>
        <span class="log-info-badge">50 terbaru</span>
    </div>
    <div class="card-body card-body-logs">
        <div id="logsContainer">
            <div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div>
        </div>
    </div>
</div>
@endsection

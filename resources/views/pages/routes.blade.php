@extends('layouts.app')

@section('title', 'Routing Table')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="map" style="width:16px;height:16px;"></i> Routing Table</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Destination</th>
                        <th>Gateway</th>
                        <th>Distance</th>
                        <th>Table</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="routesTable">
                    <tr><td colspan="5"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@extends('layouts.app')

@section('title', '🗺️ Routing <span>Table</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🗺️</span> Routing Table</h3>
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
                    <tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

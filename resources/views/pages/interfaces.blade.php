@extends('layouts.app')

@section('title', '🔌 Network Interfaces')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🔌</span> Network Interfaces</h3>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table clickable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>MAC Address</th>
                        <th>TX</th>
                        <th>RX</th>
                        <th>MTU</th>
                    </tr>
                </thead>
                <tbody id="interfacesTable">
                    <tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Interface Detail Modal -->
<div class="modal-overlay" id="ifaceModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>🔌 <span id="modalIfaceName">Interface</span></h3>
            <button class="modal-close" id="modalClose">✕</button>
        </div>
        <div class="modal-body" id="modalIfaceBody">
            Loading...
        </div>
    </div>
</div>
@endsection

@extends('layouts.app')

@section('title', 'Network Interfaces')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="ethernet-port" style="width:16px;height:16px;"></i> Network Interfaces</h3>
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
                    <tr><td colspan="7"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal-overlay" id="ifaceModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i data-lucide="ethernet-port" style="width:16px;height:16px;"></i> <span id="modalIfaceName">Interface</span></h3>
            <button class="modal-close" id="modalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <div class="modal-body" id="modalIfaceBody">
            Loading...
        </div>
    </div>
</div>
@endsection

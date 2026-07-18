@extends('layouts.app')

@section('title', '🛡️ Firewall <span>Rules</span>')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><span class="icon">🛡️</span> Firewall Rules</h3>
    </div>
    <div class="card-body">
        <div class="tabs">
            <button class="tab-btn active" data-tab="tabFilter">Filter Rules</button>
            <button class="tab-btn" data-tab="tabNat">NAT Rules</button>
        </div>

        <!-- Filter -->
        <div class="tab-content active" id="tabFilter">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Chain</th>
                            <th>Src Address</th>
                            <th>Dst Address</th>
                            <th>Protocol</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="firewallFilterTable">
                        <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- NAT -->
        <div class="tab-content" id="tabNat">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Chain</th>
                            <th>Src Address</th>
                            <th>Dst Address</th>
                            <th>Protocol</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="firewallNatTable">
                        <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

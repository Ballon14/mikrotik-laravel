@extends('layouts.app')

@section('title', 'ARP Table')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="radio" style="width:16px;height:16px;"></i> ARP Table</h3>
    </div>
    <div class="card-body">
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Interface</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="arpTable">
                    <tr><td colspan="4"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

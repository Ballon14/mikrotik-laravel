@extends('layouts.app')

@section('title', 'Firewall Rules')

@section('content')
<div class="card">
    <div class="card-header">
        <h3><i data-lucide="shield" style="width:16px;height:16px;"></i> Firewall Rules</h3>
        <span class="stale-indicator"><i data-lucide="clock" style="width:12px;height:12px;"></i> <span class="stale-text">Data lama</span></span>
    </div>
    <div class="card-body">
        <div class="tabs">
            <button class="tab-btn active" data-tab="tabFilter">Filter Rules</button>
            <button class="tab-btn" data-tab="tabNat">NAT Rules</button>
        </div>

        <div class="tab-content active" id="tabFilter">
            <div class="tab-actions">
                <button class="btn-action btn-add" id="btnAddFilter" title="Add Filter Rule">
                    <i data-lucide="plus" style="width:14px;height:14px;"></i> Add Filter
                </button>
            </div>
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
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="firewallFilterTable">
                        <tr><td colspan="8"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="tab-content" id="tabNat">
            <div class="tab-actions">
                <button class="btn-action btn-add" id="btnAddNat" title="Add NAT Rule">
                    <i data-lucide="plus" style="width:14px;height:14px;"></i> Add NAT
                </button>
            </div>
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
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="firewallNatTable">
                        <tr><td colspan="8"><div class="empty-state"><i data-lucide="loader-2" class="icon-spin"></i><div class="empty-state-text">Loading...</div></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="crud-modal" id="filterModal">
    <div class="crud-modal-content crud-modal-wide">
        <div class="crud-modal-header">
            <h3 id="filterModalTitle">Add Filter Rule</h3>
            <button class="crud-modal-close" id="filterModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="filterForm" class="crud-form">
            <input type="hidden" id="filterEditId" value="">
            <div class="form-row">
                <div class="form-group">
                    <label for="filterChain">Chain</label>
                    <select id="filterChain" name="chain" required>
                        <option value="forward">forward</option>
                        <option value="input">input</option>
                        <option value="output">output</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filterAction">Action</label>
                    <select id="filterAction" name="action" required>
                        <option value="accept">accept</option>
                        <option value="drop">drop</option>
                        <option value="reject">reject</option>
                        <option value="log">log</option>
                        <option value="passthrough">passthrough</option>
                        <option value="jump">jump</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="filterSrcAddress">Src Address</label>
                    <input type="text" id="filterSrcAddress" name="src-address" placeholder="0.0.0.0/0">
                </div>
                <div class="form-group">
                    <label for="filterDstAddress">Dst Address</label>
                    <input type="text" id="filterDstAddress" name="dst-address" placeholder="0.0.0.0/0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="filterProtocol">Protocol</label>
                    <select id="filterProtocol" name="protocol">
                        <option value="">Any</option>
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="icmp">ICMP</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filterDstPort">Dst Port</label>
                    <input type="text" id="filterDstPort" name="dst-port" placeholder="e.g. 80,443">
                </div>
            </div>
            <div class="form-group">
                <label for="filterComment">Comment</label>
                <input type="text" id="filterComment" name="comment" placeholder="Rule description">
            </div>
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="filterDisabled" name="disabled" value="yes">
                    <span>Disabled</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="filterFormCancel">Cancel</button>
                <button type="submit" class="btn-submit" id="filterFormSubmit">Save</button>
            </div>
        </form>
    </div>
</div>

<div class="crud-modal" id="natModal">
    <div class="crud-modal-content crud-modal-wide">
        <div class="crud-modal-header">
            <h3 id="natModalTitle">Add NAT Rule</h3>
            <button class="crud-modal-close" id="natModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
        <form id="natForm" class="crud-form">
            <input type="hidden" id="natEditId" value="">
            <div class="form-row">
                <div class="form-group">
                    <label for="natChain">Chain</label>
                    <select id="natChain" name="chain" required>
                        <option value="srcnat">srcnat</option>
                        <option value="dstnat">dstnat</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="natAction">Action</label>
                    <select id="natAction" name="action" required>
                        <option value="masquerade">masquerade</option>
                        <option value="src-nat">src-nat</option>
                        <option value="dst-nat">dst-nat</option>
                        <option value="redirect">redirect</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="natSrcAddress">Src Address</label>
                    <input type="text" id="natSrcAddress" name="src-address" placeholder="0.0.0.0/0">
                </div>
                <div class="form-group">
                    <label for="natDstAddress">Dst Address</label>
                    <input type="text" id="natDstAddress" name="dst-address" placeholder="0.0.0.0/0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="natProtocol">Protocol</label>
                    <select id="natProtocol" name="protocol">
                        <option value="">Any</option>
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="natDstPort">Dst Port</label>
                    <input type="text" id="natDstPort" name="dst-port" placeholder="e.g. 80,443">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="natToAddresses">To Addresses</label>
                    <input type="text" id="natToAddresses" name="to-addresses" placeholder="192.168.1.1">
                </div>
                <div class="form-group">
                    <label for="natToPorts">To Ports</label>
                    <input type="text" id="natToPorts" name="to-ports" placeholder="e.g. 80">
                </div>
            </div>
            <div class="form-group">
                <label for="natComment">Comment</label>
                <input type="text" id="natComment" name="comment" placeholder="Rule description">
            </div>
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="natDisabled" name="disabled" value="yes">
                    <span>Disabled</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="natFormCancel">Cancel</button>
                <button type="submit" class="btn-submit" id="natFormSubmit">Save</button>
            </div>
        </form>
    </div>
</div>

<div class="confirm-modal" id="confirmModal">
    <div class="confirm-modal-content">
        <i data-lucide="alert-triangle" style="width:40px;height:40px;color:#fbbf24;margin-bottom:12px;"></i>
        <h3>Konfirmasi Hapus</h3>
        <p id="confirmMessage">Apakah Anda yakin ingin menghapus item ini?</p>
        <div class="confirm-actions">
            <button class="btn-cancel" id="confirmCancel">Batal</button>
            <button class="btn-delete" id="confirmDelete">Hapus</button>
        </div>
    </div>
</div>
@endsection

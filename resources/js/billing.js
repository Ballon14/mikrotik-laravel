// Make these available globally for app.js to call
function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const BILLING_PAGE_SIZE = 25;

function renderBillingPagination(containerId, currentPage, lastPage, total, loadFn) {
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        const table = document.querySelector(`#${containerId.replace("Pagination", "Table")}`);
        if (table) {
            const wrapper = table.closest(".data-table-wrapper") || table.parentElement;
            wrapper.after(container);
        }
    }
    if (!container) return;
    if (lastPage <= 1) { container.innerHTML = ""; return; }
    const from = (currentPage - 1) * BILLING_PAGE_SIZE + 1;
    const to = Math.min(currentPage * BILLING_PAGE_SIZE, total);
    container.innerHTML = `
        <div class="pagination-bar">
            <span class="pagination-info">${from}-${to} dari ${total}</span>
            <div class="pagination-actions">
                <button class="page-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>Prev</button>
                <span style="padding:5px 8px;color:var(--text-muted);font-size:12px;">${currentPage} / ${lastPage}</span>
                <button class="page-btn" data-page="${currentPage + 1}" ${currentPage >= lastPage ? "disabled" : ""}>Next</button>
            </div>
        </div>
    `;
    container.querySelectorAll(".page-btn:not(:disabled)").forEach(btn => {
        btn.addEventListener("click", () => {
            window[loadFn](parseInt(btn.dataset.page));
        });
    });
}

window.loadPackages = async function(page) {
    try {
        const res = await fetch(`/api/packages?page=${page || 1}`);
        const data = await res.json();
        
        const tbody = document.getElementById('packagesTable');
        if (!tbody) return;

        if (!data.success || data.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada paket</div></div></td></tr>`;
            document.getElementById("packagesPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.data.data.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${esc(p.name)}</strong></td>
                <td>Rp ${Number(p.price).toLocaleString('id-ID')}</td>
                <td>${esc(p.speed || '-')}</td>
                <td>${esc(p.description || '-')}</td>
                <td>
                    <button class="btn-edit" onclick="editPackage(${p.id},'${esc(p.name)}','${esc(p.price)}','${esc(p.speed || '')}','${esc(p.description || '')}')">Edit</button>
                    <button class="btn-delete" onclick="deletePackage(${p.id})">Hapus</button>
                </td>
            </tr>
        `).join('');
        addTableLabels("packagesTable");
        renderBillingPagination("packagesPagination", data.data.current_page, data.data.last_page, data.data.total, "loadPackages");
        lucide.createIcons();
    } catch (e) {
        console.error(e);
    }
};

window.loadCustomers = async function(page) {
    try {
        const res = await fetch(`/api/customers?page=${page || 1}`);
        const data = await res.json();
        
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;

        if (!data.success || data.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada pelanggan</div></div></td></tr>`;
            document.getElementById("customersPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.data.data.map(c => {
            let statusBadge = '';
            if(c.status === 'active') statusBadge = '<span class="status-badge success">Active</span>';
            else if(c.status === 'inactive') statusBadge = '<span class="status-badge warning">Inactive</span>';
            else statusBadge = '<span class="status-badge danger">Isolated</span>';

            return `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.pppoe_username}</td>
                <td>${c.package ? c.package.name : '-'}</td>
                <td>${c.phone || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-edit" onclick="editCustomer(${c.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteCustomer(${c.id})">Hapus</button>
                </td>
            </tr>
            `;
        }).join('');
        addTableLabels("customersTable");
        renderBillingPagination("customersPagination", data.data.current_page, data.data.last_page, data.data.total, "loadCustomers");
        lucide.createIcons();
    } catch (e) {
        console.error(e);
    }
};

window.loadInvoices = async function(page) {
    try {
        const res = await fetch(`/api/invoices?page=${page || 1}`);
        const data = await res.json();
        
        const tbody = document.getElementById('invoicesTable');
        if (!tbody) return;

        if (!data.success || data.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada tagihan</div></div></td></tr>`;
            document.getElementById("invoicesPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.data.data.map(i => {
            let statusBadge = i.status === 'paid' 
                ? '<span class="status-badge success">Lunas</span>'
                : '<span class="status-badge danger">Belum Lunas</span>';

            return `
            <tr>
                <td><strong>${i.invoice_number}</strong></td>
                <td>${i.customer ? i.customer.name : '-'}</td>
                <td>${i.due_date}</td>
                <td>Rp ${Number(i.amount).toLocaleString('id-ID')}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-edit" onclick="editInvoice(${i.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteInvoice(${i.id})">Hapus</button>
                </td>
            </tr>
            `;
        }).join('');
        addTableLabels("invoicesTable");
        renderBillingPagination("invoicesPagination", data.data.current_page, data.data.last_page, data.data.total, "loadInvoices");
        lucide.createIcons();
    } catch (e) {
        console.error(e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // ---- Packages ----
    const btnAddPackage = document.getElementById('btnAddPackage');
    const modalPackage = document.getElementById('packageModal');
    if (btnAddPackage) {
        btnAddPackage.addEventListener('click', () => {
            document.getElementById('packageForm').reset();
            document.getElementById('packageEditId').value = '';
            document.getElementById('packageModalTitle').textContent = 'Tambah Paket';
            modalPackage.classList.add('active');
        });
        document.getElementById('packageModalClose').addEventListener('click', () => modalPackage.classList.remove('active'));
        document.getElementById('packageFormCancel').addEventListener('click', () => modalPackage.classList.remove('active'));

        document.getElementById('packageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('packageEditId').value;
            const data = {
                name: document.getElementById('pkgName').value,
                price: document.getElementById('pkgPrice').value,
                speed: document.getElementById('pkgSpeed').value,
                description: document.getElementById('pkgDesc').value
            };

            const action = id ? 'mengupdate' : 'menambahkan';
            const confirmed = await window.showConfirm(`Apakah Anda yakin ingin ${action} paket ini?`);
            if (!confirmed) return;

            await saveCrud(id ? `/api/packages/${id}` : '/api/packages', id ? 'PUT' : 'POST', data, () => {
                modalPackage.classList.remove('active');
                window.loadPackages();
            });
        });
    }

    // ---- Customers ----
    const btnAddCustomer = document.getElementById('btnAddCustomer');
    const modalCustomer = document.getElementById('customerModal');
    if (btnAddCustomer) {
        btnAddCustomer.addEventListener('click', async () => {
            document.getElementById('customerForm').reset();
            document.getElementById('customerEditId').value = '';
            document.getElementById('customerModalTitle').textContent = 'Tambah Pelanggan';
            await loadPackageOptions();
            modalCustomer.classList.add('active');
        });
        document.getElementById('customerModalClose').addEventListener('click', () => modalCustomer.classList.remove('active'));
        document.getElementById('customerFormCancel').addEventListener('click', () => modalCustomer.classList.remove('active'));

        document.getElementById('customerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('customerEditId').value;
            const data = {
                name: document.getElementById('custName').value,
                phone: document.getElementById('custPhone').value,
                address: document.getElementById('custAddress').value,
                pppoe_username: document.getElementById('custPppoeUser').value,
                pppoe_password: document.getElementById('custPppoePass').value,
                package_id: document.getElementById('custPackage').value,
                status: document.getElementById('custStatus').value
            };

            const action = id ? 'mengupdate' : 'menambahkan';
            const confirmed = await window.showConfirm(`Apakah Anda yakin ingin ${action} pelanggan ini?`);
            if (!confirmed) return;

            await saveCrud(id ? `/api/customers/${id}` : '/api/customers', id ? 'PUT' : 'POST', data, () => {
                modalCustomer.classList.remove('active');
                window.loadCustomers();
            });
        });
    }

    // ---- Invoices ----
    const btnAddInvoice = document.getElementById('btnAddInvoice');
    const modalInvoice = document.getElementById('invoiceModal');
    if (btnAddInvoice) {
        btnAddInvoice.addEventListener('click', async () => {
            document.getElementById('invoiceForm').reset();
            document.getElementById('invoiceEditId').value = '';
            document.getElementById('invoiceModalTitle').textContent = 'Buat Tagihan';
            await loadCustomerOptions();
            modalInvoice.classList.add('active');
        });
        document.getElementById('invoiceModalClose').addEventListener('click', () => modalInvoice.classList.remove('active'));
        document.getElementById('invoiceFormCancel').addEventListener('click', () => modalInvoice.classList.remove('active'));

        document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('invoiceEditId').value;
            const data = {
                invoice_number: document.getElementById('invNumber').value,
                customer_id: document.getElementById('invCustomer').value,
                amount: document.getElementById('invAmount').value,
                due_date: document.getElementById('invDueDate').value,
                status: document.getElementById('invStatus').value
            };

            const action = id ? 'mengupdate' : 'menambahkan';
            const confirmed = await window.showConfirm(`Apakah Anda yakin ingin ${action} tagihan ini?`);
            if (!confirmed) return;

            await saveCrud(id ? `/api/invoices/${id}` : '/api/invoices', id ? 'PUT' : 'POST', data, () => {
                modalInvoice.classList.remove('active');
                window.loadInvoices();
            });
        });
    }
});

// Edit functions
window.editPackage = function(id, name, price, speed, desc) {
    document.getElementById('packageEditId').value = id;
    document.getElementById('pkgName').value = name;
    document.getElementById('pkgPrice').value = price;
    document.getElementById('pkgSpeed').value = speed;
    document.getElementById('pkgDesc').value = desc;
    document.getElementById('packageModalTitle').textContent = 'Edit Paket';
    document.getElementById('packageModal').classList.add('active');
};

window.editCustomer = async function(id) {
    const res = await fetch('/api/customers?all=true');
    const data = await res.json();
    const c = data.data.find(x => x.id == id);
    if (c) {
        await loadPackageOptions();
        document.getElementById('customerEditId').value = c.id;
        document.getElementById('custName').value = c.name;
        document.getElementById('custPhone').value = c.phone || '';
        document.getElementById('custAddress').value = c.address || '';
        document.getElementById('custPppoeUser').value = c.pppoe_username;
        document.getElementById('custPppoePass').value = c.pppoe_password;
        document.getElementById('custPackage').value = c.package_id;
        document.getElementById('custStatus').value = c.status;
        
        document.getElementById('customerModalTitle').textContent = 'Edit Pelanggan';
        document.getElementById('customerModal').classList.add('active');
    }
};

window.editInvoice = async function(id) {
    const res = await fetch('/api/invoices?all=true');
    const data = await res.json();
    const i = data.data.find(x => x.id == id);
    if (i) {
        await loadCustomerOptions();
        document.getElementById('invoiceEditId').value = i.id;
        document.getElementById('invNumber').value = i.invoice_number;
        document.getElementById('invCustomer').value = i.customer_id;
        document.getElementById('invAmount').value = i.amount;
        document.getElementById('invDueDate').value = i.due_date;
        document.getElementById('invStatus').value = i.status;
        
        document.getElementById('invoiceModalTitle').textContent = 'Edit Tagihan';
        document.getElementById('invoiceModal').classList.add('active');
    }
};

// Delete functions
window.deletePackage = function(id) { confirmDeleteAction('packages', id, window.loadPackages); };
window.deleteCustomer = function(id) { confirmDeleteAction('customers', id, window.loadCustomers); };
window.deleteInvoice = function(id) { confirmDeleteAction('invoices', id, window.loadInvoices); };

function confirmDeleteAction(resource, id, callback) {
    const confirmModal = document.getElementById('confirmModal');
    if (!confirmModal) return;
    
    confirmModal.classList.add('active');
    
    const handler = async function() {
        await saveCrud(`/api/${resource}/${id}`, 'DELETE', {}, callback);
        confirmModal.classList.remove('active');
        document.getElementById('confirmDelete').removeEventListener('click', handler);
    };
    
    document.getElementById('confirmDelete').addEventListener('click', handler, {once: true});
    document.getElementById('confirmCancel').addEventListener('click', () => {
        confirmModal.classList.remove('active');
        document.getElementById('confirmDelete').removeEventListener('click', handler);
    }, {once: true});
}

// Helpers
async function loadPackageOptions() {
    const res = await fetch('/api/packages?all=true');
    const data = await res.json();
    const select = document.getElementById('custPackage');
    select.innerHTML = '<option value="">— Pilih Paket —</option>' + data.data.map(p => `<option value="${p.id}">${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')})</option>`).join('');
}

async function loadCustomerOptions() {
    const res = await fetch('/api/customers?all=true');
    const data = await res.json();
    const select = document.getElementById('invCustomer');
    select.innerHTML = '<option value="">— Pilih Pelanggan —</option>' + data.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function saveCrud(url, method, data, callback) {
    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json'
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : null
        });
        
        const resData = await res.json();
        
        if (res.ok && resData.success) {
            showToast('Berhasil menyimpan data', 'success');
            if (callback) callback();
        } else {
            showToast(resData.message || 'Gagal menyimpan data. Pastikan isian sudah benar (misal: username/invoice unik)', 'error');
        }
    } catch (e) {
        showToast('Error jaringan', 'error');
    }
}

// ─── Payments ───

window.loadPayments = async function(page) {
    try {
        const res = await fetch(`/api/payments?page=${page || 1}`);
        const json = await res.json();
        const tbody = document.getElementById('paymentsTable');
        if (!tbody) return;

        if (!json.success || json.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada pembayaran</div></div></td></tr>`;
            document.getElementById("paymentsPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = json.data.data.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.invoice ? esc(p.invoice.invoice_number) : '-'}</td>
                <td>${p.invoice?.customer?.name || '-'}</td>
                <td>Rp ${Number(p.amount).toLocaleString('id-ID')}</td>
                <td>${esc(p.payment_method || '-')}</td>
                <td>${esc(p.reference || '-')}</td>
                <td>${p.paid_at ? new Date(p.paid_at).toLocaleString('id-ID') : '-'}</td>
                <td><button class="btn-delete" onclick="deletePayment(${p.id})">Hapus</button></td>
            </tr>
        `).join('');
        addTableLabels("paymentsTable");
        renderBillingPagination("paymentsPagination", json.data.current_page, json.data.last_page, json.data.total, "loadPayments");
        lucide.createIcons();
    } catch(e) { console.error(e); }
};

window.loadInvoiceOptions = async function() {
    const res = await fetch('/api/invoices?all=true');
    const json = await res.json();
    const sel = document.getElementById('payInvoice');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Pilih Invoice —</option>' + json.data.map(i => `<option value="${i.id}">${i.invoice_number} - ${i.customer?.name || '-'} (Rp ${Number(i.amount).toLocaleString('id-ID')})</option>`).join('');
};

window.deletePayment = function(id) { confirmDeleteAction('payments', id, window.loadPayments); };

// ─── Routers ───

window.loadRouters = async function(page) {
    try {
        const res = await fetch(`/api/routers?page=${page || 1}`);
        const json = await res.json();
        const tbody = document.getElementById('routersTable');
        if (!tbody) return;

        if (!json.success || json.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada router</div></div></td></tr>`;
            document.getElementById("routersPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = json.data.data.map(r => `
            <tr>
                <td>${r.id}</td>
                <td><strong>${esc(r.name)}</strong></td>
                <td>${esc(r.host)}</td>
                <td>${r.port}</td>
                <td>${esc(r.username)}</td>
                <td>${r.is_active ? '<span class="status-badge success">Aktif</span>' : '<span class="status-badge warning">Nonaktif</span>'}</td>
                <td>
                    <button class="btn-edit" onclick="editRouter(${r.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteRouter(${r.id})">Hapus</button>
                </td>
            </tr>
        `).join('');
        addTableLabels("routersTable");
        renderBillingPagination("routersPagination", json.data.current_page, json.data.last_page, json.data.total, "loadRouters");
        lucide.createIcons();
    } catch(e) { console.error(e); }
};

window.editRouter = async function(id) {
    const res = await fetch('/api/routers?all=true');
    const json = await res.json();
    const r = json.data.find(x => x.id == id);
    if (!r) return;
    document.getElementById('routerEditId').value = r.id;
    document.getElementById('rtrName').value = r.name;
    document.getElementById('rtrHost').value = r.host;
    document.getElementById('rtrPort').value = r.port;
    document.getElementById('rtrUser').value = r.username;
    document.getElementById('rtrPass').value = '';
    document.getElementById('rtrActive').checked = r.is_active;
    document.getElementById('routerModalTitle').textContent = 'Edit Router';
    document.getElementById('routerModal').classList.add('active');
};

window.deleteRouter = function(id) { confirmDeleteAction('routers', id, window.loadRouters); };

// ─── PPPoE Accounts ───

window.loadPppoeAccounts = async function(page) {
    try {
        const res = await fetch(`/api/pppoe-accounts?page=${page || 1}`);
        const json = await res.json();
        const tbody = document.getElementById('pppoeTable');
        if (!tbody) return;

        if (!json.success || json.data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada akun PPPoE</div></div></td></tr>`;
            document.getElementById("pppoePagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = json.data.data.map(a => {
            const statusBadge = a.disabled
                ? '<span class="status-badge warning">Nonaktif</span>'
                : '<span class="status-badge success">Aktif</span>';
            const syncBadge = a.last_sync_at
                ? '<span class="status-badge success">Tersinkron</span>'
                : '<span class="status-badge warning">Belum sync</span>';
            return `
            <tr>
                <td>${a.id}</td>
                <td><strong>${esc(a.username)}</strong></td>
                <td>${a.customer ? esc(a.customer.name) : '-'}</td>
                <td>${a.router ? esc(a.router.name) : '-'}</td>
                <td>${esc(a.profile || '-')}</td>
                <td>${esc(a.ip_address || '-')}</td>
                <td>${statusBadge}</td>
                <td>${syncBadge}</td>
                <td>
                    <button class="btn-edit" onclick="editPppoe(${a.id})">Edit</button>
                    <button class="btn-delete" onclick="deletePppoe(${a.id})">Hapus</button>
                    <button class="btn-action" onclick="syncPppoe(${a.id})" title="Sync ke Router">Sync</button>
                </td>
            </tr>
            `;
        }).join('');
        addTableLabels("pppoeTable");
        renderBillingPagination("pppoePagination", json.data.current_page, json.data.last_page, json.data.total, "loadPppoeAccounts");
        lucide.createIcons();
    } catch(e) { console.error(e); }
};

window.editPppoe = async function(id) {
    const res = await fetch('/api/pppoe-accounts?all=true');
    const json = await res.json();
    const a = json.data.find(x => x.id == id);
    if (!a) return;
    await loadCustomerOptions();
    await loadRouterOptions();
    document.getElementById('pppoeEditId').value = a.id;
    document.getElementById('pppCustomer').value = a.customer_id;
    document.getElementById('pppRouter').value = a.router_id || '';
    document.getElementById('pppUser').value = a.username;
    document.getElementById('pppPass').value = a.password;
    document.getElementById('pppProfile').value = a.profile || '';
    document.getElementById('pppIp').value = a.ip_address || '';
    document.getElementById('pppDisabled').checked = a.disabled;
    document.getElementById('pppoeModalTitle').textContent = 'Edit Akun PPPoE';
    document.getElementById('pppoeModal').classList.add('active');
};

window.syncPppoe = async function(id) {
    try {
        const res = await fetch(`/api/pppoe-accounts/${id}/sync`, { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') } });
        const json = await res.json();
        if (json.success) {
            showToast('Sync ditambahkan ke antrian', 'success');
            window.loadPppoeAccounts();
        }
    } catch(e) { showToast('Gagal sync', 'error'); }
};

window.deletePppoe = function(id) { confirmDeleteAction('pppoe-accounts', id, window.loadPppoeAccounts); };

async function loadRouterOptions() {
    const res = await fetch('/api/routers?all=true');
    const json = await res.json();
    const sel = document.getElementById('pppRouter');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Pilih Router —</option>' + json.data.map(r => `<option value="${r.id}">${r.name} (${r.host})</option>`).join('');
}

// ─── Page-specific DOM initializers ───

// Payments page
document.addEventListener('DOMContentLoaded', () => {
    const btnAddPayment = document.getElementById('btnAddPayment');
    const modalPayment = document.getElementById('paymentModal');
    if (btnAddPayment) {
        btnAddPayment.addEventListener('click', async () => {
            document.getElementById('paymentForm').reset();
            await loadInvoiceOptions();
            modalPayment.classList.add('active');
        });
        document.getElementById('paymentModalClose').addEventListener('click', () => modalPayment.classList.remove('active'));
        document.getElementById('paymentFormCancel').addEventListener('click', () => modalPayment.classList.remove('active'));

        document.getElementById('paymentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                invoice_id: document.getElementById('payInvoice').value,
                amount: document.getElementById('payAmount').value,
                payment_method: document.getElementById('payMethod').value,
                reference: document.getElementById('payReference').value,
                notes: document.getElementById('payNotes').value,
            };
            const confirmed = await window.showConfirm('Apakah Anda yakin ingin mencatat pembayaran ini?');
            if (!confirmed) return;
            await saveCrud('/api/payments', 'POST', data, () => {
                modalPayment.classList.remove('active');
                window.loadPayments();
            });
        });
    }

    // Routers page
    const btnAddRouter = document.getElementById('btnAddRouter');
    const modalRouter = document.getElementById('routerModal');
    if (btnAddRouter) {
        btnAddRouter.addEventListener('click', () => {
            document.getElementById('routerForm').reset();
            document.getElementById('routerEditId').value = '';
            document.getElementById('routerModalTitle').textContent = 'Tambah Router';
            modalRouter.classList.add('active');
        });
        document.getElementById('routerModalClose').addEventListener('click', () => modalRouter.classList.remove('active'));
        document.getElementById('routerFormCancel').addEventListener('click', () => modalRouter.classList.remove('active'));

        document.getElementById('routerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('routerEditId').value;
            const data = {
                name: document.getElementById('rtrName').value,
                host: document.getElementById('rtrHost').value,
                port: document.getElementById('rtrPort').value || 8728,
                username: document.getElementById('rtrUser').value,
                password: document.getElementById('rtrPass').value,
                is_active: document.getElementById('rtrActive').checked,
            };

            if (!data.password && id) delete data.password;

            const action = id ? 'mengupdate' : 'menambahkan';
            const confirmed = await window.showConfirm(`Apakah Anda yakin ingin ${action} router ini?`);
            if (!confirmed) return;

            await saveCrud(id ? `/api/routers/${id}` : '/api/routers', id ? 'PUT' : 'POST', data, () => {
                modalRouter.classList.remove('active');
                window.loadRouters();
            });
        });
    }

    // PPPoE Accounts page
    const btnAddPppoe = document.getElementById('btnAddPppoe');
    const modalPppoe = document.getElementById('pppoeModal');
    if (btnAddPppoe) {
        btnAddPppoe.addEventListener('click', async () => {
            document.getElementById('pppoeForm').reset();
            document.getElementById('pppoeEditId').value = '';
            document.getElementById('pppoeModalTitle').textContent = 'Tambah Akun PPPoE';
            await loadCustomerOptions();
            await loadRouterOptions();
            modalPppoe.classList.add('active');
        });
        document.getElementById('pppoeModalClose').addEventListener('click', () => modalPppoe.classList.remove('active'));
        document.getElementById('pppoeFormCancel').addEventListener('click', () => modalPppoe.classList.remove('active'));

        document.getElementById('pppoeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('pppoeEditId').value;
            const data = {
                customer_id: document.getElementById('pppCustomer').value,
                router_id: document.getElementById('pppRouter').value || null,
                username: document.getElementById('pppUser').value,
                password: document.getElementById('pppPass').value,
                profile: document.getElementById('pppProfile').value || null,
                ip_address: document.getElementById('pppIp').value || null,
                disabled: document.getElementById('pppDisabled').checked,
            };
            const action = id ? 'mengupdate' : 'menambahkan';
            const confirmed = await window.showConfirm(`Apakah Anda yakin ingin ${action} akun PPPoE ini?`);
            if (!confirmed) return;
            await saveCrud(id ? `/api/pppoe-accounts/${id}` : '/api/pppoe-accounts', id ? 'PUT' : 'POST', data, () => {
                modalPppoe.classList.remove('active');
                window.loadPppoeAccounts();
            });
        });
    }

    // Page-specific loaders
    if (document.getElementById('paymentsTable')) window.loadPayments();
    if (document.getElementById('routersTable')) window.loadRouters();
    if (document.getElementById('pppoeTable')) window.loadPppoeAccounts();
});

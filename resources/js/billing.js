// Make these available globally for app.js to call
function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.loadPackages = async function() {
    try {
        const res = await fetch('/api/packages');
        const data = await res.json();
        
        const tbody = document.getElementById('packagesTable');
        if (!tbody) return;

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada paket</div></div></td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map(p => `
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
        lucide.createIcons();
    } catch (e) {
        console.error(e);
    }
};

window.loadCustomers = async function() {
    try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada pelanggan</div></div></td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map(c => {
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
        lucide.createIcons();
    } catch (e) {
        console.error(e);
    }
};

window.loadInvoices = async function() {
    try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        
        const tbody = document.getElementById('invoicesTable');
        if (!tbody) return;

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Belum ada tagihan</div></div></td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map(i => {
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
    // In a real app we might fetch the specific customer or find from local state, for now fetch from api
    const res = await fetch('/api/customers');
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
    const res = await fetch('/api/invoices');
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
    const res = await fetch('/api/packages');
    const data = await res.json();
    const select = document.getElementById('custPackage');
    select.innerHTML = '<option value="">— Pilih Paket —</option>' + data.data.map(p => `<option value="${p.id}">${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')})</option>`).join('');
}

async function loadCustomerOptions() {
    const res = await fetch('/api/customers');
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

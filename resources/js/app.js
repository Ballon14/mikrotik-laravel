/* ═══════════════════════════════════════════════════════
   MikroTik Dashboard — Frontend Application Logic
   ═══════════════════════════════════════════════════════ */
import './billing.js';

// ─── State ───
const state = {
    connected: false,
    routerName: "MikroTik",
    activeSection: "overview",
    refreshInterval: 5000,
    isRefreshing: false,
    intervalId: null,
    data: {},
    modalOpen: false, // Prevent refresh while modal is open
    pendingConfirm: null, // For delete confirmation
    sectionTimestamps: {}, // section => ISO string of last successful fetch
};

// ─── CSRF Token ───
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// ─── API Layer ───
async function apiFetch(endpoint) {
    try {
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success) {
            return json.data;
        }
        throw new Error(json.error || "Unknown error");
    } catch (err) {
        console.error(`[API] ${endpoint}:`, err.message);
        throw err;
    }
}

async function apiPost(endpoint, data) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Operation failed');
    return json;
}

async function apiPut(endpoint, data) {
    const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Operation failed');
    return json;
}

async function apiDelete(endpoint) {
    const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json',
        },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Operation failed');
    return json;
}

// ─── Utility Functions ───
function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return "0 B";
    bytes = Number(bytes);
    const k = 1024;
    const sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

function formatBits(bits, decimals = 1) {
    if (!bits || bits === 0) return "0 b";
    bits = Number(bits);
    const k = 1024;
    const sizes = ["b", "Kib", "Mib", "Gib", "Tib"];
    const i = Math.floor(Math.log(bits) / Math.log(k));
    return parseFloat((bits / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

function formatSpeed(bitsPerSec) {
    if (!bitsPerSec || bitsPerSec === 0) return "0 bps";
    const num = Number(bitsPerSec);
    if (num >= 1073741824) return (num / 1073741824).toFixed(2) + " Gibps";
    if (num >= 1048576) return (num / 1048576).toFixed(2) + " Mibps";
    if (num >= 1024) return (num / 1024).toFixed(2) + " Kibps";
    return num + " bps";
}

function formatUptime(uptime) {
    if (!uptime) return "-";
    return uptime
        .replace(/w/g, "w ")
        .replace(/d/g, "d ")
        .replace(/h/g, "h ")
        .replace(/m/g, "m ")
        .replace(/s$/g, "s");
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function percentUsed(free, total) {
    if (!free || !total) return 0;
    const used = Number(total) - Number(free);
    return Math.round((used / Number(total)) * 100);
}

// ─── Navigation ───
function setupNavigation() {
    // Mobile toggle
    const toggle = document.getElementById("mobileToggle");
    const overlay = document.getElementById("mobileOverlay");
    if (toggle) {
        toggle.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("open");
            overlay.classList.toggle("active");
        });
    }
    if (overlay) {
        overlay.addEventListener("click", closeMobileSidebar);
    }
}

function closeMobileSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("mobileOverlay").classList.remove("active");
}

// ─── Data Loading ───
async function loadSectionData(section) {
    // Skip refresh when modal is open
    if (state.modalOpen) return;

    const spinner = document.getElementById("refreshSpinner");
    if (spinner) spinner.classList.add("active");
    state.isRefreshing = true;

    try {
        switch (section) {
            case "overview":
                await loadOverview();
                break;
            case "interfaces":
                await loadInterfaces();
                break;
            case "dhcp":
                await loadDHCP();
                break;
            case "routes":
                await loadRoutes();
                break;
            case "firewall":
                await loadFirewall();
                break;
            case "arp":
                await loadARP();
                break;
            case "logs":
                await loadLogs();
                break;
            case "hotspot":
                await loadHotspot();
                break;
            case "ip-addresses":
                await loadIpAddresses();
                break;
            case "ip-isolation":
                await loadIpIsolation();
                break;
            case "packages":
                if (typeof window.loadPackages === 'function') await window.loadPackages();
                break;
            case "customers":
                if (typeof window.loadCustomers === 'function') await window.loadCustomers();
                break;
            case "invoices":
                if (typeof window.loadInvoices === 'function') await window.loadInvoices();
                break;
        }
        updateConnectionStatus(true);
    } catch (err) {
        updateConnectionStatus(false, err.message);
        updateStaleIndicator(state.activeSection, true);
        showToast("Koneksi ke MikroTik gagal: " + err.message, "error");
    } finally {
        lucide.createIcons();
        if (spinner) spinner.classList.remove("active");
        state.isRefreshing = false;
    }
}

// ─── Connection Status ───
function updateConnectionStatus(connected, error) {
    state.connected = connected;
    const el = document.getElementById("connectionStatus");
    if (!el) return;

    el.className = `connection-status ${connected ? "connected" : "disconnected"}`;
    const valueEl = el.querySelector(".value");
    if (valueEl) {
        valueEl.textContent = connected ? state.routerName : "Disconnected";
    }
}

// ─── Stale Data Helpers ───
function markSectionLoaded(section) {
    state.sectionTimestamps[section] = Date.now();
    updateStaleIndicator(section, false);
}

function updateStaleIndicator(section, isStale) {
    document.querySelectorAll('.stale-indicator').forEach(el => {
        el.classList.toggle('visible', isStale);
    });
}

function hasPrevData(section) {
    return state.sectionTimestamps[section] !== undefined;
}

function isDataStale(section) {
    const ts = state.sectionTimestamps[section];
    if (!ts) return true;
    return (Date.now() - ts) > 30000; // stale if >30s since last update
}

// ─── Toast Notifications ───
let toastTimeout;
function showToast(message, type = "error") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// ─── Confirmation Dialog ───
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        const msgEl = document.getElementById("confirmMessage");
        const cancelBtn = document.getElementById("confirmCancel");
        const deleteBtn = document.getElementById("confirmDelete");

        if (!modal) { resolve(false); return; }

        msgEl.textContent = message;
        modal.classList.add("show");

        const cleanup = () => {
            modal.classList.remove("show");
            cancelBtn.removeEventListener("click", onCancel);
            deleteBtn.removeEventListener("click", onConfirm);
        };

        const onCancel = () => { cleanup(); resolve(false); };
        const onConfirm = () => { cleanup(); resolve(true); };

        cancelBtn.addEventListener("click", onCancel);
        deleteBtn.addEventListener("click", onConfirm);
    });
}

// ─── CRUD Modal Helper ───
function openCrudModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("show");
        state.modalOpen = true;
    }
}

function closeCrudModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("show");
        state.modalOpen = false;
    }
}

// ─── Section: Overview ───
async function loadOverview() {
    const [resource, identity] = await Promise.all([
        apiFetch("/api/router"),
        apiFetch("/api/identity"),
    ]);

    state.data.resource = resource;
    state.data.identity = identity;

    if (identity && identity.name) {
        state.routerName = identity.name;
        const nameEl = document.getElementById("routerNameDisplay");
        if (nameEl) nameEl.textContent = identity.name;
        updateConnectionStatus(true);
    }

    if (!resource) return;

    // CPU
    const cpuLoad = resource.cpuLoad || 0;
    setStatValue("cpuValue", cpuLoad + "%");
    setProgressBar("cpuProgress", cpuLoad, cpuLoad > 80 ? "red" : cpuLoad > 50 ? "cyan" : "green");

    // RAM
    const totalMem = Number(resource.totalMemory || 0);
    const freeMem = Number(resource.freeMemory || 0);
    const usedMem = totalMem - freeMem;
    const ramPercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;
    setStatValue("ramValue", ramPercent + "%");
    setStatSub("ramSub", `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`);
    setProgressBar("ramProgress", ramPercent, ramPercent > 80 ? "red" : ramPercent > 50 ? "cyan" : "green");

    // HDD
    const totalHdd = Number(resource.totalHddSpace || 0);
    const freeHdd = Number(resource.freeHddSpace || 0);
    const usedHdd = totalHdd - freeHdd;
    const hddPercent = totalHdd > 0 ? Math.round((usedHdd / totalHdd) * 100) : 0;
    setStatValue("hddValue", hddPercent + "%");
    setStatSub("hddSub", `${formatBytes(usedHdd)} / ${formatBytes(totalHdd)}`);

    // Uptime
    setStatValue("uptimeValue", formatUptime(resource.uptime));

    // System info grid
    const sysInfo = {
        boardName: resource.boardName || "-",
        architecture: resource.architectureName || "-",
        version: resource.version || "-",
        cpuModel: resource.cpu || "-",
        cpuCount: resource.cpuCount || "-",
        cpuFreq: resource.cpuFrequency ? resource.cpuFrequency + " MHz" : "-",
    };

    setInfoValue("infoBoardName", sysInfo.boardName);
    setInfoValue("infoArchitecture", sysInfo.architecture);
    setInfoValue("infoVersion", sysInfo.version);
    setInfoValue("infoCPU", sysInfo.cpuModel);
    setInfoValue("infoCPUCount", sysInfo.cpuCount);
    setInfoValue("infoCPUFreq", sysInfo.cpuFreq);

    // Load traffic charts
    await loadTrafficCharts();
}

function setStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setStatSub(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setProgressBar(id, percent, colorClass) {
    const el = document.getElementById(id);
    if (el) {
        el.style.width = Math.min(100, percent) + "%";
        el.className = `progress-fill ${colorClass}`;
    }
}

function setInfoValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ─── Traffic Charts ───
const chartCanvases = {};

async function loadTrafficCharts() {
    try {
        const [uplinkData, bridgeData] = await Promise.all([
            apiFetch("/api/traffic/ether1-UPLINK-ISP").catch(() => []),
            apiFetch("/api/traffic/bridge1-DISTRIBUSI-SERVER").catch(() => []),
        ]);

        renderTrafficChart("Uplink", uplinkData, "chartWrapUplink", "chartStatusUplink", "legendRxUplink", "legendTxUplink");
        renderTrafficChart("Bridge", bridgeData, "chartWrapBridge", "chartStatusBridge", "legendRxBridge", "legendTxBridge");
    } catch (err) {
        console.warn("[Charts] Error:", err.message);
    }
}

function renderTrafficChart(key, data, wrapId, statusId, rxLegendId, txLegendId) {
    const wrap = document.getElementById(wrapId);
    const statusEl = document.getElementById(statusId);
    const rxLegend = document.getElementById(rxLegendId);
    const txLegend = document.getElementById(txLegendId);
    if (!wrap) return;

    if (!data || data.length < 2) {
        // Still collecting
        if (!wrap.querySelector(".chart-waiting")) {
            wrap.innerHTML = `<div class="chart-waiting"><div class="dot-pulse"><span></span><span></span><span></span></div>Mengumpulkan data traffic...</div>`;
        }
        if (statusEl) statusEl.textContent = `${data ? data.length : 0}/2 samples`;
        return;
    }

    // Create canvas if not exists
    let canvas = chartCanvases[key];
    if (!canvas) {
        wrap.innerHTML = "";
        canvas = document.createElement("canvas");
        wrap.appendChild(canvas);
        chartCanvases[key] = canvas;
    }

    // Set canvas resolution
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    const PADDING = { top: 10, right: 10, bottom: 24, left: 55 };
    const chartW = W - PADDING.left - PADDING.right;
    const chartH = H - PADDING.top - PADDING.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Find max value for Y axis
    let maxVal = 0;
    data.forEach((d) => {
        maxVal = Math.max(maxVal, d.rxRate || 0, d.txRate || 0);
    });
    maxVal = Math.max(maxVal, 1024); // min 1 KB/s scale
    maxVal *= 1.15; // headroom

    // Grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.07)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(100, 116, 139, 0.7)";
    ctx.textAlign = "right";
    for (let i = 0; i <= gridLines; i++) {
        const y = PADDING.top + (chartH / gridLines) * i;
        const val = maxVal - (maxVal / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(W - PADDING.right, y);
        ctx.stroke();
        ctx.fillText(formatSpeed(val * 8), PADDING.left - 5, y + 3);
    }

    // Draw lines
    function drawLine(points, key, color, fillColor) {
        if (points.length < 2) return;
        const step = chartW / (Math.max(points.length - 1, 1));

        ctx.beginPath();
        points.forEach((p, i) => {
            const x = PADDING.left + i * step;
            const val = p[key] || 0;
            const y = PADDING.top + chartH - (val / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Fill under curve
        const lastX = PADDING.left + (points.length - 1) * step;
        ctx.lineTo(lastX, PADDING.top + chartH);
        ctx.lineTo(PADDING.left, PADDING.top + chartH);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    drawLine(data, "rxRate", "#22d3ee", "rgba(34, 211, 238, 0.08)");
    drawLine(data, "txRate", "#34d399", "rgba(52, 211, 153, 0.08)");

    // Time labels
    ctx.fillStyle = "rgba(100, 116, 139, 0.5)";
    ctx.textAlign = "center";
    ctx.font = "9px 'JetBrains Mono', monospace";
    const timeY = H - 4;
    if (data.length >= 2) {
        const oldest = new Date(data[0].ts);
        const newest = new Date(data[data.length - 1].ts);
        ctx.fillText(oldest.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), PADDING.left, timeY);
        ctx.fillText(newest.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), W - PADDING.right, timeY);
    }

    // Update status & legend
    const last = data[data.length - 1];
    if (statusEl) statusEl.textContent = `${data.length} samples`;
    if (rxLegend) rxLegend.textContent = formatSpeed(last.rxRate * 8);
    if (txLegend) txLegend.textContent = formatSpeed(last.txRate * 8);
}

// ─── Section: Interfaces ───
async function loadInterfaces() {
    const data = await apiFetch("/api/interfaces");
    state.data.interfaces = data;
    const tbody = document.getElementById("interfacesTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('interfaces')) return;
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i data-lucide="ethernet-port" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada interface ditemukan</div></div></td></tr>`;
        return;
    }

    // Update badge count
    updateNavBadge("interfaces", data.length);

    tbody.innerHTML = data
        .map((iface) => {
            const isRunning = iface.running === "true" || iface.running === true;
            const isDisabled = iface.disabled === "true" || iface.disabled === true;
            let badgeClass = "badge-disabled";
            let badgeText = "Disabled";
            if (!isDisabled && isRunning) {
                badgeClass = "badge-running";
                badgeText = "Running";
            } else if (!isDisabled && !isRunning) {
                badgeClass = "badge-inactive";
                badgeText = "Down";
            }

            return `<tr data-iface-name="${escapeHtml(iface.name)}">
                <td>${escapeHtml(iface.name || "-")}</td>
                <td>${escapeHtml(iface.type || "-")}</td>
                <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${badgeText}</span></td>
                <td>${escapeHtml(iface.macAddress || "-")}</td>
                <td style="color:var(--accent-green)">↑ ${formatBits((iface.txByte || 0) * 8)}</td>
                <td style="color:var(--accent-cyan)">↓ ${formatBits((iface.rxByte || 0) * 8)}</td>
                <td>${iface.mtu || "-"}</td>
            </tr>`;
        })
        .join("");

    markSectionLoaded('interfaces');

    // Attach click handlers
    tbody.querySelectorAll("tr[data-iface-name]").forEach((row) => {
        row.addEventListener("click", () => {
            openInterfaceModal(row.dataset.ifaceName);
        });
    });
}

// ─── Interface Detail Modal ───
async function openInterfaceModal(name) {
    const modal = document.getElementById("ifaceModal");
    const nameEl = document.getElementById("modalIfaceName");
    const bodyEl = document.getElementById("modalIfaceBody");
    if (!modal || !bodyEl) return;

    nameEl.textContent = name;
    bodyEl.innerHTML = `<div class="empty-state"><i data-lucide="loader-2" class="icon-spin" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Loading...</div></div>`;
    modal.classList.add("show");

    try {
        const iface = await apiFetch(`/api/interface/${encodeURIComponent(name)}`);
        if (!iface) {
            bodyEl.innerHTML = `<div class="empty-state"><i data-lucide="alert-circle" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Interface not found</div></div>`;
            return;
        }

        const isRunning = iface.running === "true" || iface.running === true;
        const isDisabled = iface.disabled === "true" || iface.disabled === true;
        let statusBadge = "badge-disabled";
        let statusText = "Disabled";
        if (!isDisabled && isRunning) { statusBadge = "badge-running"; statusText = "Running"; }
        else if (!isDisabled && !isRunning) { statusBadge = "badge-inactive"; statusText = "Down"; }

        bodyEl.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-item-label">Name</div>
                    <div class="info-item-value">${escapeHtml(iface.name)}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">Type</div>
                    <div class="info-item-value">${escapeHtml(iface.type || "-")}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">Status</div>
                    <div class="info-item-value"><span class="badge ${statusBadge}"><span class="badge-dot"></span>${statusText}</span></div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">MAC Address</div>
                    <div class="info-item-value">${escapeHtml(iface.macAddress || "-")}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">MTU / Actual MTU</div>
                    <div class="info-item-value">${iface.mtu || "-"} / ${iface.actualMtu || "-"}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">L2 MTU</div>
                    <div class="info-item-value">${iface.l2mtu || "-"}</div>
                </div>
            </div>

            <div class="modal-section-title"><i data-lucide="layout-dashboard" style="width:14px;height:14px;"></i> Traffic Statistics</div>
            <div class="modal-stats-row">
                <div class="modal-stat">
                    <div class="label">TX (Upload)</div>
                    <div class="value green">${formatBits((iface.txByte || 0) * 8)}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">RX (Download)</div>
                    <div class="value cyan">${formatBits((iface.rxByte || 0) * 8)}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">TX Packets</div>
                    <div class="value green">${Number(iface.txPacket || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">RX Packets</div>
                    <div class="value cyan">${Number(iface.rxPacket || 0).toLocaleString()}</div>
                </div>
            </div>

            <div class="modal-section-title"><i data-lucide="alert-triangle" style="width:14px;height:14px;"></i> Errors & Drops</div>
            <div class="modal-stats-row">
                <div class="modal-stat">
                    <div class="label">TX Errors</div>
                    <div class="value ${Number(iface.txError) > 0 ? 'red' : ''}">${Number(iface.txError || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">RX Errors</div>
                    <div class="value ${Number(iface.rxError) > 0 ? 'red' : ''}">${Number(iface.rxError || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">TX Drops</div>
                    <div class="value ${Number(iface.txDrop) > 0 ? 'red' : ''}">${Number(iface.txDrop || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">RX Drops</div>
                    <div class="value ${Number(iface.rxDrop) > 0 ? 'red' : ''}">${Number(iface.rxDrop || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">Link Downs</div>
                    <div class="value ${Number(iface.linkDowns) > 0 ? 'red' : ''}">${Number(iface.linkDowns || 0).toLocaleString()}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">Queue Drops</div>
                    <div class="value ${Number(iface.txQueueDrop) > 0 ? 'red' : ''}">${Number(iface.txQueueDrop || 0).toLocaleString()}</div>
                </div>
            </div>

            <div class="modal-section-title"><i data-lucide="clock" style="width:14px;height:14px;"></i> Link History</div>
            <div class="modal-stats-row">
                <div class="modal-stat">
                    <div class="label">Last Link Up</div>
                    <div class="value">${escapeHtml(iface.lastLinkUpTime || "-")}</div>
                </div>
                <div class="modal-stat">
                    <div class="label">Last Link Down</div>
                    <div class="value">${escapeHtml(iface.lastLinkDownTime || "-")}</div>
                </div>
            </div>
        `;
    } catch (err) {
        bodyEl.innerHTML = `<div class="empty-state"><i data-lucide="alert-circle" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">${escapeHtml(err.message)}</div></div>`;
    }
}

function closeInterfaceModal() {
    const modal = document.getElementById("ifaceModal");
    if (modal) modal.classList.remove("show");
}

function setupModal() {
    const modal = document.getElementById("ifaceModal");
    const closeBtn = document.getElementById("modalClose");

    if (closeBtn) closeBtn.addEventListener("click", closeInterfaceModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeInterfaceModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeInterfaceModal();
            // Close CRUD modals
            document.querySelectorAll(".crud-modal.show").forEach(m => {
                m.classList.remove("show");
                state.modalOpen = false;
            });
        }
    });
}

// ─── Section: DHCP Leases (with CRUD) ───
async function loadDHCP() {
    const data = await apiFetch("/api/dhcp-leases");
    state.data.dhcp = data;

    // Also load isolated IPs to show isolation status
    let isolatedIps = [];
    try {
        isolatedIps = await apiFetch("/api/isolated-ips");
    } catch (e) {}

    const tbody = document.getElementById("dhcpTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('dhcp')) return;
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i data-lucide="list" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada DHCP lease</div></div></td></tr>`;
        return;
    }

    updateNavBadge("dhcp", data.length);

    tbody.innerHTML = data
        .map((lease) => {
            const isBound = lease.status === "bound";
            const badgeClass = isBound ? "badge-bound" : "badge-inactive";
            const badgeText = lease.status || "unknown";
            const isIsolated = isolatedIps.includes(lease.address);
            const leaseId = lease['.id'] || lease.id || '';

            return `<tr>
                <td>${escapeHtml(lease.hostName || "-")}</td>
                <td>
                    ${escapeHtml(lease.address || "-")}
                    ${isIsolated ? '<span class="badge badge-isolated"><i data-lucide="lock" style="width:10px;height:10px;"></i> Isolated</span>' : ''}
                </td>
                <td>${escapeHtml(lease.macAddress || "-")}</td>
                <td>${escapeHtml(lease.server || "-")}</td>
                <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${badgeText}</span></td>
                <td>${escapeHtml(lease.lastSeen || "-")}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" title="Edit" onclick="editDhcpLease('${escapeHtml(leaseId)}', ${JSON.stringify(lease).replace(/'/g, "\\'").replace(/"/g, '&quot;')})"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                    <button class="btn-icon btn-delete-icon" title="Delete" onclick="deleteDhcpLease('${escapeHtml(leaseId)}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    ${!isIsolated
                        ? `                    <button class="btn-icon btn-isolate" title="Isolate IP" onclick="quickIsolate('${escapeHtml(lease.address)}')"><i data-lucide="lock" style="width:14px;height:14px;"></i></button>`
                        : `<button class="btn-icon btn-unisolate" title="Unisolate IP" onclick="quickUnisolate('${escapeHtml(lease.address)}')"><i data-lucide="lock-open" style="width:14px;height:14px;"></i></button>`
                    }
                </td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('dhcp');
}

// DHCP CRUD handlers
function setupDhcpCrud() {
    const btnAdd = document.getElementById("btnAddDhcp");
    const modalClose = document.getElementById("dhcpModalClose");
    const formCancel = document.getElementById("dhcpFormCancel");
    const form = document.getElementById("dhcpForm");

    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            document.getElementById("dhcpModalTitle").textContent = "Add DHCP Lease";
            document.getElementById("dhcpEditId").value = "";
            form.reset();
            openCrudModal("dhcpModal");
        });
    }

    if (modalClose) modalClose.addEventListener("click", () => closeCrudModal("dhcpModal"));
    if (formCancel) formCancel.addEventListener("click", () => closeCrudModal("dhcpModal"));

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const editId = document.getElementById("dhcpEditId").value;
            const data = {
                'address': document.getElementById("dhcpAddress").value,
                'mac-address': document.getElementById("dhcpMacAddress").value,
                'server': document.getElementById("dhcpServer").value,
                'comment': document.getElementById("dhcpComment").value,
            };

            try {
                if (editId) {
                    await apiPut(`/api/dhcp-leases/${encodeURIComponent(editId)}`, data);
                    showToast("DHCP lease berhasil diupdate", "success");
                } else {
                    await apiPost("/api/dhcp-leases", data);
                    showToast("DHCP lease berhasil ditambahkan", "success");
                }
                closeCrudModal("dhcpModal");
                await loadDHCP();
            } catch (err) {
                showToast("Gagal: " + err.message, "error");
            }
        });
    }
}

window.editDhcpLease = function(id, leaseJson) {
    const lease = typeof leaseJson === 'string' ? JSON.parse(leaseJson) : leaseJson;
    document.getElementById("dhcpModalTitle").textContent = "Edit DHCP Lease";
    document.getElementById("dhcpEditId").value = id;
    document.getElementById("dhcpAddress").value = lease.address || '';
    document.getElementById("dhcpMacAddress").value = lease.macAddress || '';
    document.getElementById("dhcpServer").value = lease.server || '';
    document.getElementById("dhcpComment").value = lease.comment || '';
    openCrudModal("dhcpModal");
};

window.deleteDhcpLease = async function(id) {
    const confirmed = await showConfirm("Apakah Anda yakin ingin menghapus DHCP lease ini?");
    if (!confirmed) return;
    try {
        await apiDelete(`/api/dhcp-leases/${encodeURIComponent(id)}`);
        showToast("DHCP lease berhasil dihapus", "success");
        await loadDHCP();
    } catch (err) {
        showToast("Gagal menghapus: " + err.message, "error");
    }
};

// ─── Quick Isolate / Unisolate (global) ───
window.quickIsolate = async function(ip) {
    const confirmed = await showConfirm(`Isolasi IP ${ip}? Traffic forward akan diblokir.`);
    if (!confirmed) return;
    try {
        await apiPost("/api/isolate-ip", { ip });
        showToast(`IP ${ip} berhasil diisolasi`, "success");
        loadSectionData(state.activeSection);
    } catch (err) {
        showToast("Gagal isolasi: " + err.message, "error");
    }
};

window.quickUnisolate = async function(ip) {
    const confirmed = await showConfirm(`Unisolasi IP ${ip}? Traffic akan dikembalikan normal.`);
    if (!confirmed) return;
    try {
        await apiPost("/api/unisolate-ip", { ip });
        showToast(`IP ${ip} berhasil diunisolasi`, "success");
        loadSectionData(state.activeSection);
    } catch (err) {
        showToast("Gagal unisolasi: " + err.message, "error");
    }
};

// ─── Section: Routes ───
async function loadRoutes() {
    const data = await apiFetch("/api/routes");
    state.data.routes = data;
    const tbody = document.getElementById("routesTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('routes')) return;
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i data-lucide="map" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada route</div></div></td></tr>`;
        return;
    }

    updateNavBadge("routes", data.length);

    tbody.innerHTML = data
        .map((route) => {
            const isActive = route.active === "true" || route.active === true;
            const badgeClass = isActive ? "badge-active" : "badge-inactive";

            return `<tr>
                <td>${escapeHtml(route.dstAddress || "-")}</td>
                <td>${escapeHtml(route.gateway || "-")}</td>
                <td>${escapeHtml(route.distance || "-")}</td>
                <td>${escapeHtml(route.routingTable || "main")}</td>
                <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${isActive ? "Active" : "Inactive"}</span></td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('routes');
}

// ─── Section: Firewall (with CRUD) ───
async function loadFirewall() {
    const [filterData, natData] = await Promise.all([
        apiFetch("/api/firewall/filter").catch(() => []),
        apiFetch("/api/firewall/nat").catch(() => []),
    ]);

    state.data.firewallFilter = filterData;
    state.data.firewallNat = natData;

    renderFirewallFilter(filterData);
    renderFirewallNat(natData);
}

function renderFirewallFilter(data) {
    const tbody = document.getElementById("firewallFilterTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('firewall-filter')) return;
        tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i data-lucide="shield" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada filter rule</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = data
        .map((rule, i) => {
            const ruleId = rule['.id'] || rule.id || '';
            const isDisabled = rule.disabled === "true" || rule.disabled === true;
            return `<tr class="${isDisabled ? 'row-disabled' : ''}">
                <td>${i + 1}</td>
                <td><span class="badge ${rule.chain === 'forward' ? 'badge-info' : rule.chain === 'input' ? 'badge-warning' : 'badge-active'}">${escapeHtml(rule.chain || "-")}</span></td>
                <td>${escapeHtml(rule.srcAddress || "any")}</td>
                <td>${escapeHtml(rule.dstAddress || "any")}</td>
                <td>${escapeHtml(rule.protocol || "any")}</td>
                <td><span class="badge ${rule.action === 'drop' || rule.action === 'reject' ? 'badge-error' : 'badge-active'}">${escapeHtml(rule.action || "-")}</span></td>
                <td class="comment-cell">${escapeHtml(rule.comment || "-")}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" title="Edit" onclick='editFirewallFilter("${escapeHtml(ruleId)}", ${JSON.stringify(rule).replace(/'/g, "\\'").replace(/"/g, "&quot;")})'><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                    <button class="btn-icon btn-delete-icon" title="Delete" onclick="deleteFirewallFilter('${escapeHtml(ruleId)}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                </td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('firewall-filter');
}

function renderFirewallNat(data) {
    const tbody = document.getElementById("firewallNatTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('firewall-nat')) return;
        tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i data-lucide="shuffle" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada NAT rule</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = data
        .map((rule, i) => {
            const ruleId = rule['.id'] || rule.id || '';
            const isDisabled = rule.disabled === "true" || rule.disabled === true;
            return `<tr class="${isDisabled ? 'row-disabled' : ''}">
                <td>${i + 1}</td>
                <td><span class="badge badge-info">${escapeHtml(rule.chain || "-")}</span></td>
                <td>${escapeHtml(rule.srcAddress || "any")}</td>
                <td>${escapeHtml(rule.dstAddress || "any")}</td>
                <td>${escapeHtml(rule.protocol || "any")}</td>
                <td><span class="badge badge-active">${escapeHtml(rule.action || "-")}</span></td>
                <td class="comment-cell">${escapeHtml(rule.comment || "-")}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" title="Edit" onclick='editFirewallNat("${escapeHtml(ruleId)}", ${JSON.stringify(rule).replace(/'/g, "\\'").replace(/"/g, "&quot;")})'><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                    <button class="btn-icon btn-delete-icon" title="Delete" onclick="deleteFirewallNat('${escapeHtml(ruleId)}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                </td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('firewall-nat');
}

// Firewall CRUD handlers
function setupFirewallCrud() {
    // Filter modal
    const btnAddFilter = document.getElementById("btnAddFilter");
    const filterClose = document.getElementById("filterModalClose");
    const filterCancel = document.getElementById("filterFormCancel");
    const filterForm = document.getElementById("filterForm");

    if (btnAddFilter) {
        btnAddFilter.addEventListener("click", () => {
            document.getElementById("filterModalTitle").textContent = "Add Filter Rule";
            document.getElementById("filterEditId").value = "";
            filterForm.reset();
            openCrudModal("filterModal");
        });
    }

    if (filterClose) filterClose.addEventListener("click", () => closeCrudModal("filterModal"));
    if (filterCancel) filterCancel.addEventListener("click", () => closeCrudModal("filterModal"));

    if (filterForm) {
        filterForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const editId = document.getElementById("filterEditId").value;
            const data = {
                'chain': document.getElementById("filterChain").value,
                'action': document.getElementById("filterAction").value,
                'src-address': document.getElementById("filterSrcAddress").value,
                'dst-address': document.getElementById("filterDstAddress").value,
                'protocol': document.getElementById("filterProtocol").value,
                'dst-port': document.getElementById("filterDstPort").value,
                'comment': document.getElementById("filterComment").value,
                'disabled': document.getElementById("filterDisabled").checked ? 'yes' : 'no',
            };

            try {
                if (editId) {
                    await apiPut(`/api/firewall/filter/${encodeURIComponent(editId)}`, data);
                    showToast("Filter rule berhasil diupdate", "success");
                } else {
                    await apiPost("/api/firewall/filter", data);
                    showToast("Filter rule berhasil ditambahkan", "success");
                }
                closeCrudModal("filterModal");
                await loadFirewall();
            } catch (err) {
                showToast("Gagal: " + err.message, "error");
            }
        });
    }

    // NAT modal
    const btnAddNat = document.getElementById("btnAddNat");
    const natClose = document.getElementById("natModalClose");
    const natCancel = document.getElementById("natFormCancel");
    const natForm = document.getElementById("natForm");

    if (btnAddNat) {
        btnAddNat.addEventListener("click", () => {
            document.getElementById("natModalTitle").textContent = "Add NAT Rule";
            document.getElementById("natEditId").value = "";
            natForm.reset();
            openCrudModal("natModal");
        });
    }

    if (natClose) natClose.addEventListener("click", () => closeCrudModal("natModal"));
    if (natCancel) natCancel.addEventListener("click", () => closeCrudModal("natModal"));

    if (natForm) {
        natForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const editId = document.getElementById("natEditId").value;
            const data = {
                'chain': document.getElementById("natChain").value,
                'action': document.getElementById("natAction").value,
                'src-address': document.getElementById("natSrcAddress").value,
                'dst-address': document.getElementById("natDstAddress").value,
                'protocol': document.getElementById("natProtocol").value,
                'dst-port': document.getElementById("natDstPort").value,
                'to-addresses': document.getElementById("natToAddresses").value,
                'to-ports': document.getElementById("natToPorts").value,
                'comment': document.getElementById("natComment").value,
                'disabled': document.getElementById("natDisabled").checked ? 'yes' : 'no',
            };

            try {
                if (editId) {
                    await apiPut(`/api/firewall/nat/${encodeURIComponent(editId)}`, data);
                    showToast("NAT rule berhasil diupdate", "success");
                } else {
                    await apiPost("/api/firewall/nat", data);
                    showToast("NAT rule berhasil ditambahkan", "success");
                }
                closeCrudModal("natModal");
                await loadFirewall();
            } catch (err) {
                showToast("Gagal: " + err.message, "error");
            }
        });
    }
}

window.editFirewallFilter = function(id, ruleJson) {
    const rule = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
    document.getElementById("filterModalTitle").textContent = "Edit Filter Rule";
    document.getElementById("filterEditId").value = id;
    document.getElementById("filterChain").value = rule.chain || 'forward';
    document.getElementById("filterAction").value = rule.action || 'accept';
    document.getElementById("filterSrcAddress").value = rule.srcAddress || '';
    document.getElementById("filterDstAddress").value = rule.dstAddress || '';
    document.getElementById("filterProtocol").value = rule.protocol || '';
    document.getElementById("filterDstPort").value = rule.dstPort || '';
    document.getElementById("filterComment").value = rule.comment || '';
    document.getElementById("filterDisabled").checked = (rule.disabled === 'true' || rule.disabled === true);
    openCrudModal("filterModal");
};

window.deleteFirewallFilter = async function(id) {
    const confirmed = await showConfirm("Apakah Anda yakin ingin menghapus filter rule ini?");
    if (!confirmed) return;
    try {
        await apiDelete(`/api/firewall/filter/${encodeURIComponent(id)}`);
        showToast("Filter rule berhasil dihapus", "success");
        await loadFirewall();
    } catch (err) {
        showToast("Gagal menghapus: " + err.message, "error");
    }
};

window.editFirewallNat = function(id, ruleJson) {
    const rule = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
    document.getElementById("natModalTitle").textContent = "Edit NAT Rule";
    document.getElementById("natEditId").value = id;
    document.getElementById("natChain").value = rule.chain || 'srcnat';
    document.getElementById("natAction").value = rule.action || 'masquerade';
    document.getElementById("natSrcAddress").value = rule.srcAddress || '';
    document.getElementById("natDstAddress").value = rule.dstAddress || '';
    document.getElementById("natProtocol").value = rule.protocol || '';
    document.getElementById("natDstPort").value = rule.dstPort || '';
    document.getElementById("natToAddresses").value = rule.toAddresses || '';
    document.getElementById("natToPorts").value = rule.toPorts || '';
    document.getElementById("natComment").value = rule.comment || '';
    document.getElementById("natDisabled").checked = (rule.disabled === 'true' || rule.disabled === true);
    openCrudModal("natModal");
};

window.deleteFirewallNat = async function(id) {
    const confirmed = await showConfirm("Apakah Anda yakin ingin menghapus NAT rule ini?");
    if (!confirmed) return;
    try {
        await apiDelete(`/api/firewall/nat/${encodeURIComponent(id)}`);
        showToast("NAT rule berhasil dihapus", "success");
        await loadFirewall();
    } catch (err) {
        showToast("Gagal menghapus: " + err.message, "error");
    }
};

// Firewall tabs
function setupFirewallTabs() {
    document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabGroup = btn.closest(".card");
            tabGroup.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            tabGroup.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
            btn.classList.add("active");
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add("active");
        });
    });
}

// ─── Section: ARP ───
async function loadARP() {
    const data = await apiFetch("/api/arp");
    state.data.arp = data;

    let isolatedIps = [];
    try {
        isolatedIps = await apiFetch("/api/isolated-ips");
    } catch (e) {}

    const tbody = document.getElementById("arpTable");
    if (!tbody) return;

    if (!data || data.length === 0) {
        if (hasPrevData('arp')) return;
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i data-lucide="radio" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada ARP entry</div></div></td></tr>`;
        return;
    }

    updateNavBadge("arp", data.length);

    tbody.innerHTML = data
        .map((entry) => {
            const isComplete = entry.complete === "true" || entry.complete === true;
            const isIsolated = isolatedIps.includes(entry.address);
            return `<tr>
                <td>
                    ${escapeHtml(entry.address || "-")}
                    ${isIsolated ? '<span class="badge badge-isolated"><i data-lucide="lock" style="width:10px;height:10px;"></i> Isolated</span>' : ''}
                </td>
                <td>${escapeHtml(entry.macAddress || "-")}</td>
                <td>${escapeHtml(entry.interface || "-")}</td>
                <td><span class="badge ${isComplete ? 'badge-active' : 'badge-inactive'}"><span class="badge-dot"></span>${isComplete ? "Complete" : "Incomplete"}</span></td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('arp');
}

// ─── Section: Logs ───
async function loadLogs() {
    const data = await apiFetch("/api/logs");
    state.data.logs = data;
    const container = document.getElementById("logsContainer");
    if (!container) return;

    if (!data || data.length === 0) {
        if (hasPrevData('logs')) return;
        container.innerHTML = `<div class="empty-state"><i data-lucide="file-text" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada log</div></div>`;
        return;
    }

    // Reverse to show newest first
    const reversed = [...data].reverse();

    container.innerHTML = reversed
        .map((log) => {
            const topics = (log.topics || "").toLowerCase();
            let logClass = "log-default";
            if (topics.includes("error") || topics.includes("critical")) logClass = "log-error";
            else if (topics.includes("warning")) logClass = "log-warning";
            else if (topics.includes("info")) logClass = "log-info";
            else if (topics.includes("system")) logClass = "log-system";

            return `<div class="log-entry ${logClass}">
                <span class="log-time">${escapeHtml(log.time || "")}</span>
                <span class="log-topics">${escapeHtml(log.topics || "")}</span>
                <span class="log-message">${escapeHtml(log.message || "")}</span>
            </div>`;
        })
        .join("");
    markSectionLoaded('logs');
}

// ─── Section: Hotspot ───
async function loadHotspot() {
    try {
        const data = await apiFetch("/api/hotspot/active");
        state.data.hotspot = data;
        const tbody = document.getElementById("hotspotTable");
        if (!tbody) return;

        if (!data || data.length === 0) {
            if (hasPrevData('hotspot')) return;
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="wifi" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada user hotspot aktif</div></div></td></tr>`;
            return;
        }

        updateNavBadge("hotspot", data.length);

        tbody.innerHTML = data
            .map((user) => {
                return `<tr>
                    <td>${escapeHtml(user.user || "-")}</td>
                    <td>${escapeHtml(user.address || "-")}</td>
                    <td>${escapeHtml(user.macAddress || "-")}</td>
                    <td>${formatUptime(user.uptime || "")}</td>
                    <td>${formatBits((user.bytesIn || 0) * 8)}</td>
                    <td>${formatBits((user.bytesOut || 0) * 8)}</td>
                </tr>`;
            })
            .join("");
        markSectionLoaded('hotspot');
    } catch {
        const tbody = document.getElementById("hotspotTable");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="alert-triangle" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Hotspot tidak tersedia di router ini</div><div class="empty-state-sub">Fitur ini memerlukan konfigurasi Hotspot di MikroTik</div></div></td></tr>`;
        }
    }
}

// ─── Section: IP Addresses (CRUD) ───
async function loadIpAddresses() {
    const data = await apiFetch("/api/ip-addresses");
    state.data.ipAddresses = data;
    const tbody = document.getElementById("ipAddressTable");
    if (!tbody) return;

    // Populate interface select
    await populateInterfaceSelect();

    if (!data || data.length === 0) {
        if (hasPrevData('ip-addresses')) return;
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="globe" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada IP address</div></div></td></tr>`;
        return;
    }

    updateNavBadge("ip-addresses", data.length);

    tbody.innerHTML = data
        .map((addr) => {
            const addrId = addr['.id'] || addr.id || '';
            const isDisabled = addr.disabled === "true" || addr.disabled === true;
            const isDynamic = addr.dynamic === "true" || addr.dynamic === true;
            return `<tr class="${isDisabled ? 'row-disabled' : ''}">
                <td><span class="mono">${escapeHtml(addr.address || "-")}</span></td>
                <td>${escapeHtml(addr.network || "-")}</td>
                <td>${escapeHtml(addr.interface || "-")}</td>
                <td>
                    ${isDynamic ? '<span class="badge badge-info">Dynamic</span>' : '<span class="badge badge-active">Static</span>'}
                    ${isDisabled ? '<span class="badge badge-disabled">Disabled</span>' : ''}
                </td>
                <td class="comment-cell">${escapeHtml(addr.comment || "-")}</td>
                <td class="actions-cell">
                    ${!isDynamic ? `
                        <button class="btn-icon btn-edit" title="Edit" onclick='editIpAddress("${escapeHtml(addrId)}", ${JSON.stringify(addr).replace(/'/g, "\\'").replace(/"/g, "&quot;")})'><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                        <button class="btn-icon btn-delete-icon" title="Delete" onclick="deleteIpAddress('${escapeHtml(addrId)}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    ` : '<span class="text-muted">—</span>'}
                </td>
            </tr>`;
        })
        .join("");
    markSectionLoaded('ip-addresses');
}

async function populateInterfaceSelect() {
    const select = document.getElementById("ipAddrInterface");
    if (!select || select.options.length > 1) return; // Already populated

    try {
        const interfaces = await apiFetch("/api/interfaces");
        if (interfaces && interfaces.length > 0) {
            interfaces.forEach(iface => {
                const opt = document.createElement("option");
                opt.value = iface.name;
                opt.textContent = iface.name;
                select.appendChild(opt);
            });
        }
    } catch (e) {}
}

function setupIpAddressCrud() {
    const btnAdd = document.getElementById("btnAddIpAddress");
    const modalClose = document.getElementById("ipAddressModalClose");
    const formCancel = document.getElementById("ipAddressFormCancel");
    const form = document.getElementById("ipAddressForm");

    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            document.getElementById("ipAddressModalTitle").textContent = "Add IP Address";
            document.getElementById("ipAddressEditId").value = "";
            form.reset();
            openCrudModal("ipAddressModal");
        });
    }

    if (modalClose) modalClose.addEventListener("click", () => closeCrudModal("ipAddressModal"));
    if (formCancel) formCancel.addEventListener("click", () => closeCrudModal("ipAddressModal"));

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const editId = document.getElementById("ipAddressEditId").value;
            const data = {
                'address': document.getElementById("ipAddrAddress").value,
                'interface': document.getElementById("ipAddrInterface").value,
                'comment': document.getElementById("ipAddrComment").value,
                'disabled': document.getElementById("ipAddrDisabled").checked ? 'yes' : 'no',
            };

            try {
                if (editId) {
                    await apiPut(`/api/ip-addresses/${encodeURIComponent(editId)}`, data);
                    showToast("IP address berhasil diupdate", "success");
                } else {
                    await apiPost("/api/ip-addresses", data);
                    showToast("IP address berhasil ditambahkan", "success");
                }
                closeCrudModal("ipAddressModal");
                await loadIpAddresses();
            } catch (err) {
                showToast("Gagal: " + err.message, "error");
            }
        });
    }
}

window.editIpAddress = function(id, addrJson) {
    const addr = typeof addrJson === 'string' ? JSON.parse(addrJson) : addrJson;
    document.getElementById("ipAddressModalTitle").textContent = "Edit IP Address";
    document.getElementById("ipAddressEditId").value = id;
    document.getElementById("ipAddrAddress").value = addr.address || '';
    document.getElementById("ipAddrInterface").value = addr.interface || '';
    document.getElementById("ipAddrComment").value = addr.comment || '';
    document.getElementById("ipAddrDisabled").checked = (addr.disabled === 'true' || addr.disabled === true);
    openCrudModal("ipAddressModal");
};

window.deleteIpAddress = async function(id) {
    const confirmed = await showConfirm("Apakah Anda yakin ingin menghapus IP address ini?");
    if (!confirmed) return;
    try {
        await apiDelete(`/api/ip-addresses/${encodeURIComponent(id)}`);
        showToast("IP address berhasil dihapus", "success");
        await loadIpAddresses();
    } catch (err) {
        showToast("Gagal menghapus: " + err.message, "error");
    }
};

// ─── Section: IP Isolation ───
async function loadIpIsolation() {
    // Load isolated IPs
    let isolatedIps = [];
    try {
        isolatedIps = await apiFetch("/api/isolated-ips");
    } catch (e) {}

    // Load DHCP data for quick isolate
    let dhcpData = [];
    try {
        dhcpData = await apiFetch("/api/dhcp-leases");
    } catch (e) {}

    // Render isolated IPs table
    const isolatedTable = document.getElementById("isolatedTable");
    const isolatedCount = document.getElementById("isolatedCount");

    if (isolatedCount) isolatedCount.textContent = isolatedIps.length;

    if (isolatedTable) {
        if (!isolatedIps || isolatedIps.length === 0) {
            if (hasPrevData('ip-isolation')) return;
            isolatedTable.innerHTML = `<tr><td colspan="3"><div class="empty-state"><i data-lucide="check-circle" style="width:24px;height:24px;color:#34d399;"></i><div class="empty-state-text">Tidak ada IP yang diisolasi</div></div></td></tr>`;
        } else {
            isolatedTable.innerHTML = isolatedIps
                .map((ip) => {
                    return `<tr>
                        <td><span class="mono">${escapeHtml(ip)}</span></td>
                        <td><span class="badge badge-isolated"><i data-lucide="lock" style="width:10px;height:10px;"></i> Isolated</span></td>
                        <td class="actions-cell">
                                <button class="btn-action btn-unisolate-action" onclick="quickUnisolate('${escapeHtml(ip)}')">
                                    <i data-lucide="lock-open" style="width:14px;height:14px;"></i> Unisolasi
                                </button>
                        </td>
                    </tr>`;
                })
                .join("");
        }
    }

    // Render DHCP clients for quick isolate
    const dhcpIsolateTable = document.getElementById("dhcpIsolateTable");
    if (dhcpIsolateTable) {
        if (!dhcpData || dhcpData.length === 0) {
            if (hasPrevData('ip-isolation')) return;
            dhcpIsolateTable.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i data-lucide="list" style="width:24px;height:24px;opacity:0.5;"></i><div class="empty-state-text">Tidak ada DHCP client</div></div></td></tr>`;
        } else {
            dhcpIsolateTable.innerHTML = dhcpData
                .map((lease) => {
                    const isBound = lease.status === "bound";
                    const badgeClass = isBound ? "badge-bound" : "badge-inactive";
                    const isIsolated = isolatedIps.includes(lease.address);

                    return `<tr>
                        <td>${escapeHtml(lease.hostName || "-")}</td>
                        <td><span class="mono">${escapeHtml(lease.address || "-")}</span></td>
                        <td>${escapeHtml(lease.macAddress || "-")}</td>
                        <td>
                            <span class="badge ${badgeClass}"><span class="badge-dot"></span>${lease.status || "unknown"}</span>
                            ${isIsolated ? '<span class="badge badge-isolated"><i data-lucide="lock" style="width:10px;height:10px;"></i></span>' : ''}
                        </td>
                        <td class="actions-cell">
                            ${!isIsolated
                                ? `<button class="btn-action btn-isolate-action" onclick="quickIsolate('${escapeHtml(lease.address)}')"><i data-lucide="lock" style="width:14px;height:14px;"></i> Isolasi</button>`
                                : `<button class="btn-action btn-unisolate-action" onclick="quickUnisolate('${escapeHtml(lease.address)}')"><i data-lucide="lock-open" style="width:14px;height:14px;"></i> Unisolasi</button>`
                            }
                        </td>
                    </tr>`;
                })
                .join("");
        }
    }
    markSectionLoaded('ip-isolation');
}

function setupIpIsolation() {
    const form = document.getElementById("quickIsolateForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const ip = document.getElementById("quickIsolateIp").value.trim();
            if (!ip) return;

            try {
                await apiPost("/api/isolate-ip", { ip });
                showToast(`IP ${ip} berhasil diisolasi`, "success");
                document.getElementById("quickIsolateIp").value = "";
                await loadIpIsolation();
            } catch (err) {
                showToast("Gagal isolasi: " + err.message, "error");
            }
        });
    }
}

// ─── Nav Badge Update ───
function updateNavBadge(section, count) {
    const badge = document.querySelector(`.nav-item[data-section="${section}"] .nav-item-badge`);
    if (badge) badge.textContent = count;
}

// ─── Initialization ───
async function init() {
    setupNavigation();
    setupFirewallTabs();
    setupModal();
    setupDhcpCrud();
    setupFirewallCrud();
    setupIpAddressCrud();
    setupIpIsolation();

    // Determine active section based on URL
    const path = window.location.pathname;
    let section = 'overview';
    if (path === '/interfaces') section = 'interfaces';
    else if (path === '/dhcp') section = 'dhcp';
    else if (path === '/routes') section = 'routes';
    else if (path === '/firewall') section = 'firewall';
    else if (path === '/arp') section = 'arp';
    else if (path === '/logs') section = 'logs';
    else if (path === '/hotspot') section = 'hotspot';
    else if (path === '/ip-addresses') section = 'ip-addresses';
    else if (path === '/ip-isolation') section = 'ip-isolation';
    
    state.activeSection = section;

    // Load initial data
    await loadSectionData(section);

    // Initial Identity load if not overview (to get router name)
    if (section !== 'overview') {
        try {
            const identity = await apiFetch("/api/identity");
            if (identity && identity.name) {
                state.routerName = identity.name;
                const nameEl = document.getElementById("routerNameDisplay");
                if (nameEl) nameEl.textContent = identity.name;
            }
        } catch (e) {}
    }

    state.intervalId = setInterval(() => {
        if (!state.isRefreshing && !state.modalOpen) {
            loadSectionData(state.activeSection);
        }
    }, state.refreshInterval);
}

document.addEventListener("DOMContentLoaded", init);

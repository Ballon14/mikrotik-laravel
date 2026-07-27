export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B"
  bytes = Number(bytes)
  const k = 1024
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

export function formatBits(bits, decimals = 1) {
  if (!bits || bits === 0) return "0 b"
  bits = Number(bits)
  const k = 1024
  const sizes = ["b", "Kib", "Mib", "Gib", "Tib"]
  const i = Math.floor(Math.log(bits) / Math.log(k))
  return parseFloat((bits / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

export function formatSpeed(bitsPerSec) {
  if (!bitsPerSec || bitsPerSec === 0) return "0 bps"
  const num = Number(bitsPerSec)
  if (num >= 1073741824) return (num / 1073741824).toFixed(2) + " Gibps"
  if (num >= 1048576) return (num / 1048576).toFixed(2) + " Mibps"
  if (num >= 1024) return (num / 1024).toFixed(2) + " Kibps"
  return num + " bps"
}

export function formatUptime(uptime) {
  if (!uptime) return "-"
  return uptime
    .replace(/w/g, "w ")
    .replace(/d/g, "d ")
    .replace(/h/g, "h ")
    .replace(/m/g, "m ")
    .replace(/s$/g, "s")
}

export function escapeHtml(text) {
  if (!text) return ""
  const s = String(text)
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
  return s.replace(/[&<>"']/g, m => map[m])
}

#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { RouterosAPI } from '../lib/routeros.mjs'

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json')
const CACHE_TTL_S = 180

const host = process.env.MIKROTIK_HOST || '10.10.10.1'
const user = process.env.MIKROTIK_USER || 'admin'
const password = process.env.MIKROTIK_PASSWORD || 'admin123'

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`[${ts}] ${msg}`)
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function writeCache(data) {
  data.updatedAt = new Date().toISOString()
  if (data.daemonHealthy === undefined) data.daemonHealthy = true
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
}

function mergeAndWrite(partial) {
  const cur = readCache()
  Object.assign(cur, partial, { updatedAt: new Date().toISOString(), daemonHealthy: true })
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cur, null, 2))
}

async function fetchData(api, command) {
  try {
    const result = await api.comm(command)
    if (!Array.isArray(result)) return null
    if (result[0] && typeof result[0] === 'string' && result[0].startsWith('!trap')) return null
    return result
  } catch {
    return null
  }
}

function updateTrafficHistory(cache, interfaces) {
  const now = Date.now()
  const traffic = { ...(cache.traffic || {}) }

  for (const iface of interfaces) {
    const name = iface.name
    if (!name) continue

    const rxBytes = parseFloat(iface['rx-byte'] || 0)
    const txBytes = parseFloat(iface['tx-byte'] || 0)

    const prevKey = `_traffic_prev_${name}`
    const prev = cache[prevKey]
    const history = traffic[name] || []

    if (prev) {
      const dt = (now - prev.ts) / 1000
      if (dt > 0) {
        const rxRate = Math.max(0, (rxBytes - prev.rx) / dt)
        const txRate = Math.max(0, (txBytes - prev.tx) / dt)
        history.push({ ts: now, rxRate: Math.round(rxRate), txRate: Math.round(txRate) })
        if (history.length > 60) history.splice(0, history.length - 60)
      }
    }

    cache[prevKey] = { rx: rxBytes, tx: txBytes, ts: now }
    traffic[name] = history
  }

  return traffic
}

function extractIsolatedIps(fwFilter) {
  if (!Array.isArray(fwFilter)) return []
  const ips = []
  for (const rule of fwFilter) {
    const comment = rule.comment || ''
    if (comment.startsWith('ISOLASI_IP::')) {
      const ip = comment.slice('ISOLASI_IP::'.length)
      if (ip && !ips.includes(ip)) ips.push(ip)
    }
  }
  return ips
}

async function run() {
  log('Starting MikroTik Monitor Daemon...')

  const api = new RouterosAPI(5)

  while (true) {
    try {
      log(`Connecting to ${host} ...`)
      const ok = await api.connect(host, user, password)
      if (!ok) {
        log('Failed to connect. Retrying in 5 seconds...')
        await new Promise(r => setTimeout(r, 5000))
        continue
      }

      log('Connected.')
      let counter = 0

      while (true) {
        const cache = readCache()

        const resources = await fetchData(api, '/system/resource/print')
        const interfaces = await fetchData(api, '/interface/print')

        let partial = {}
        if (resources) partial.resources = resources[0]
        if (interfaces) partial.interfaces = interfaces

        if (interfaces) {
          partial.traffic = updateTrafficHistory(cache, interfaces)
        }

        if (counter % 5 === 0) {
          const slowCommands = [
            ['/system/identity/print', 'identity', r => r[0] || null],
            ['/ip/dhcp-server/lease/print', 'dhcpLeases'],
            ['/ip/route/print', 'routes'],
            ['/ip/firewall/filter/print', 'firewallFilter'],
            ['/ip/firewall/nat/print', 'firewallNat'],
            ['/ip/arp/print', 'arp'],
            ['/ip/address/print', 'ipAddresses'],
            ['/ip/dns/print', 'dns', r => r[0] || null],
          ]

          for (const [cmd, key, transform] of slowCommands) {
            const result = await fetchData(api, cmd)
            if (result) partial[key] = transform ? transform(result) : result
          }

          const logs = await fetchData(api, '/log/print')
          if (logs) partial.logs = logs.slice(-50)

          const hotspot = await fetchData(api, '/ip/hotspot/active/print')
          if (hotspot) partial.hotspotActive = hotspot

          if (partial.firewallFilter) {
            partial.isolatedIps = extractIsolatedIps(partial.firewallFilter)
          }
        }

        // Clean up internal tracking keys before writing
        const clean = {}
        for (const [k, v] of Object.entries(partial)) {
          if (!k.startsWith('_traffic_prev_')) clean[k] = v
        }
        // But preserve traffic prev keys from cache
        for (const [k, v] of Object.entries(cache)) {
          if (k.startsWith('_traffic_prev_')) clean[k] = v
        }
        // Merge traffic from partial
        if (partial.traffic) clean.traffic = partial.traffic

        mergeAndWrite(clean)
        log(`Cycle ${counter} complete`)

        counter++
        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err) {
      log(`Connection dropped: ${err.message}`)
      const cur = readCache()
      cur.daemonHealthy = false
      writeCache(cur)
      try { api.disconnect() } catch {}
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

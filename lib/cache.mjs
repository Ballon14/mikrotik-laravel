import fs from 'node:fs'
import path from 'node:path'

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json')

let _cache = null

export function readCache() {
  if (_cache) return _cache
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    _cache = JSON.parse(raw)
    return _cache
  } catch {
    return {}
  }
}

export function refreshCache() {
  _cache = null
  return readCache()
}

export function clearCacheMemory() {
  _cache = null
}

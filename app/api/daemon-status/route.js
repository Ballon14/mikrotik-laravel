import { success } from "@/lib/api-utils.mjs"
import { readCache } from "@/lib/cache.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  const cache = readCache()
  return success({
    healthy: cache.daemonHealthy === true,
    lastRun: cache.updatedAt || null,
    version: '1.2',
  })
}

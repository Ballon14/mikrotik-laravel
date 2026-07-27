import { success, withAuth } from "@/lib/api-utils.mjs"
import { getAuditLogs } from "@/lib/audit.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all) {
    const data = await getAuditLogs(1, 999999)
    return success(data.data)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const result = await getAuditLogs(page)
  return success(result)
})

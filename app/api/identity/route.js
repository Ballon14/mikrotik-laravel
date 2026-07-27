import { success, withAuth } from "@/lib/api-utils.mjs"
import { getSystemIdentity } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  return success(getSystemIdentity())
})

import { success, withAuth } from "@/lib/api-utils.mjs"
import { getInterfaces } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  return success(getInterfaces())
})

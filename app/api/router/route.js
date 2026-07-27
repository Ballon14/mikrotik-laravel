import { success, withAuth } from "@/lib/api-utils.mjs"
import { getSystemResource, getSystemIdentity } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  const resource = getSystemResource()
  const identity = getSystemIdentity()
  return success({ resource, identity })
})

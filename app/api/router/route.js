import { success } from "@/lib/api-utils.mjs"
import { getSystemResource, getSystemIdentity } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  const resource = getSystemResource()
  const identity = getSystemIdentity()
  return success({ resource, identity })
}

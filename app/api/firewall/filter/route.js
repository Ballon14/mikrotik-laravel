import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { addFirewallFilter, updateFirewallFilter, deleteFirewallFilter } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const POST = withAuth(async (req) => {
  const body = await getBody(req)
  await addFirewallFilter(body)
  return success({ message: 'Filter rule created' })
})

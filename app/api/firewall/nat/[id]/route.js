import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { updateFirewallNat, deleteFirewallNat } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = params.id
  const body = await getBody(req)
  await updateFirewallNat(id, body)
  return success({ message: 'NAT rule updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = params.id
  if (!id) return error('Rule ID required')
  await deleteFirewallNat(id)
  return success({ message: 'NAT rule deleted' })
})

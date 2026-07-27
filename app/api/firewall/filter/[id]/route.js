import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { updateFirewallFilter, deleteFirewallFilter } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = params.id
  const body = await getBody(req)
  await updateFirewallFilter(id, body)
  return success({ message: 'Filter rule updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = params.id
  if (!id) return error('Rule ID required')
  await deleteFirewallFilter(id)
  return success({ message: 'Filter rule deleted' })
})

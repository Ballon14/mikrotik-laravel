import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { updateDhcpLease, deleteDhcpLease } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = params.id
  const body = await getBody(req)
  await updateDhcpLease(id, body)
  return success({ message: 'DHCP lease updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = params.id
  if (!id) return error('Lease ID required')
  await deleteDhcpLease(id)
  return success({ message: 'DHCP lease deleted' })
})

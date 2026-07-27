import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { updateIpAddress, deleteIpAddress } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = params.id
  const body = await getBody(req)
  await updateIpAddress(id, body)
  return success({ message: 'IP address updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = params.id
  if (!id) return error('IP address ID required')
  await deleteIpAddress(id)
  return success({ message: 'IP address deleted' })
})

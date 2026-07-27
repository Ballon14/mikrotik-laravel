import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { getDhcpLeases, addDhcpLease } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  return success(getDhcpLeases())
})

export const POST = withAuth(async (req) => {
  const body = await getBody(req)
  await addDhcpLease(body)
  return success({ message: 'DHCP lease created' })
})

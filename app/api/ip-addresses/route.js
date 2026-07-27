import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { getIpAddresses, addIpAddress } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  return success(getIpAddresses())
})

export const POST = withAuth(async (req) => {
  const body = await getBody(req)
  await addIpAddress(body)
  return success({ message: 'IP address created' })
})

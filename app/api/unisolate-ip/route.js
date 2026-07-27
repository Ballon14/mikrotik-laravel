import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { unisolateIp } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export const POST = withAuth(async (req) => {
  const body = await getBody(req)
  const { ip } = body
  if (!ip) return error('IP address required')
  const result = await unisolateIp(ip)
  return success({ message: `IP ${ip} berhasil diunisolasi`, removed: result.removed })
})

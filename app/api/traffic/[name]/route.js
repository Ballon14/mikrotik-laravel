import { success } from "@/lib/api-utils.mjs"
import { getTraffic } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  return success(getTraffic(params.name))
}

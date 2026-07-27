import { success } from "@/lib/api-utils.mjs"
import { getSystemIdentity } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  return success(getSystemIdentity())
}

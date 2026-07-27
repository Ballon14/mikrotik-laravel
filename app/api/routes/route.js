import { success } from "@/lib/api-utils.mjs"
import { getRoutes } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  return success(getRoutes())
}

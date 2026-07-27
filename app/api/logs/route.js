import { success } from "@/lib/api-utils.mjs"
import { getLogs } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  return success(getLogs())
}

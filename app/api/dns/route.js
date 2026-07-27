import { success } from "@/lib/api-utils.mjs"
import { getDns } from "@/lib/mikrotik-service.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  return success(getDns())
}

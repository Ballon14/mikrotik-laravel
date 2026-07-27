import { success } from "@/lib/api-utils.mjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  return success({ status: 'ok', app: 'mikrotik-next' })
}

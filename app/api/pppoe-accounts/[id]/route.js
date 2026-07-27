import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const body = await getBody(req)
  const original = await prisma.pppoeAccount.findUnique({ where: { id } })
  if (!original) return error('PPPoE account not found', 404)

  const data = {}
  if (body.router_id !== undefined) data.routerId = body.router_id ? parseInt(body.router_id) : null
  if (body.password !== undefined) data.password = body.password
  if (body.profile !== undefined) data.profile = body.profile || null
  if (body.ip_address !== undefined) data.ipAddress = body.ip_address || null
  if (body.disabled !== undefined) data.disabled = body.disabled === true || body.disabled === 'true'

  const updated = await prisma.pppoeAccount.update({
    where: { id },
    data,
    include: { customer: true, router: true },
  })

  try {
    const syncService = new PppoeSyncService()
    await syncService.sync(updated)
  } catch (e) {
    console.error('[Sync PPPoE]', e.message)
  }

  await createAuditLog({
    action: 'pppoe_account_updated',
    entityType: 'pppoe_account',
    entityId: id,
    description: `Akun PPPoE ${updated.username} diupdate`,
    oldValues: original,
    newValues: updated,
    userId: req.userId,
  })

  return success({ message: 'PPPoE account updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const account = await prisma.pppoeAccount.findUnique({
    where: { id },
    include: { router: true },
  })
  if (!account) return error('PPPoE account not found', 404)

  try {
    const syncService = new PppoeSyncService()
    await syncService.removeFromRouter(account.username)
  } catch (e) {
    console.error('[Remove PPPoE]', e.message)
  }

  await prisma.pppoeAccount.delete({ where: { id } })

  await createAuditLog({
    action: 'pppoe_account_deleted',
    entityType: 'pppoe_account',
    entityId: id,
    description: `Akun PPPoE ${account.username} dihapus`,
    oldValues: account,
    userId: req.userId,
  })

  return success({ message: 'PPPoE account deleted' })
})

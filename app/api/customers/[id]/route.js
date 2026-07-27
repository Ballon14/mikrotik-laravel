import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const body = await getBody(req)
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { pppoeAccounts: true },
  })
  if (!customer) return error('Customer not found', 404)

  const oldStatus = customer.status
  const oldValues = { ...customer }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      name: body.name,
      nik: body.nik || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      pppoeUsername: body.pppoe_username,
      pppoePassword: body.pppoe_password,
      packageId: parseInt(body.package_id),
      status: body.status || customer.status,
    },
  })

  const account = customer.pppoeAccounts[0]
  if (account) {
    await prisma.pppoeAccount.update({
      where: { id: account.id },
      data: {
        username: body.pppoe_username,
        password: body.pppoe_password,
      },
    })

    if (body.status === 'active') {
      try {
        const syncService = new PppoeSyncService()
        await syncService.sync({ ...account, username: body.pppoe_username, password: body.pppoe_password })
      } catch (e) {
        console.error('[Sync PPPoE]', e.message)
      }
    }
  }

  if (oldStatus !== 'active' && body.status === 'active') {
    try {
      const syncService = new PppoeSyncService()
      await syncService.enableOnRouter(body.pppoe_username)
    } catch (e) {
      console.error('[Activate]', e.message)
    }
  }

  await createAuditLog({
    action: 'customer_updated',
    entityType: 'customer',
    entityId: id,
    description: `Pelanggan ${updated.name} diupdate`,
    oldValues,
    newValues: updated,
    userId: req.userId,
  })

  return success({ message: 'Customer updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { pppoeAccounts: true },
  })
  if (!customer) return error('Customer not found', 404)

  for (const account of customer.pppoeAccounts) {
    await prisma.pppoeAccount.delete({ where: { id: account.id } })
  }

  await prisma.customer.delete({ where: { id } })

  await createAuditLog({
    action: 'customer_deleted',
    entityType: 'customer',
    entityId: id,
    description: `Pelanggan ${customer.name} dihapus`,
    oldValues: { name: customer.name },
    userId: req.userId,
  })

  return success({ message: 'Customer deleted' })
})

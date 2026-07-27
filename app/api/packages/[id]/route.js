import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const body = await getBody(req)
  const original = await prisma.package.findUnique({ where: { id } })
  if (!original) return error('Package not found', 404)

  const updated = await prisma.package.update({
    where: { id },
    data: {
      name: body.name,
      price: parseFloat(body.price),
      speed: body.speed || null,
      description: body.description || null,
      billingPeriod: body.billing_period || original.billingPeriod,
    },
  })

  await createAuditLog({
    action: 'package_updated',
    entityType: 'package',
    entityId: id,
    description: `Paket ${updated.name} diupdate`,
    oldValues: original,
    newValues: updated,
    userId: req.userId,
  })

  return success({ message: 'Package updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const pkg = await prisma.package.findUnique({ where: { id } })
  if (!pkg) return error('Package not found', 404)

  await prisma.package.delete({ where: { id } })

  await createAuditLog({
    action: 'package_deleted',
    entityType: 'package',
    entityId: id,
    description: `Paket ${pkg.name} dihapus`,
    oldValues: pkg,
    userId: req.userId,
  })

  return success({ message: 'Package deleted' })
})

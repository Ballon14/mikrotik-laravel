import { success, error, withAuth } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment) return error('Payment not found', 404)

  await prisma.payment.delete({ where: { id } })

  await createAuditLog({
    action: 'payment_deleted',
    entityType: 'payment',
    entityId: id,
    description: `Pembayaran #${id} dihapus`,
    oldValues: payment,
    userId: req.userId,
  })

  return success({ message: 'Payment deleted' })
})

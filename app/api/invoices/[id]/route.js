import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const body = await getBody(req)
  const original = await prisma.invoice.findUnique({ where: { id } })
  if (!original) return error('Invoice not found', 404)

  let paidAt = original.paidAt
  if (body.status === 'paid' && original.status === 'unpaid') {
    paidAt = new Date()
  } else if (body.status === 'unpaid') {
    paidAt = null
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      customerId: parseInt(body.customer_id),
      invoiceNumber: body.invoice_number,
      amount: parseFloat(body.amount),
      status: body.status,
      dueDate: body.due_date,
      periodStart: body.period_start || null,
      periodEnd: body.period_end || null,
      paidAt,
    },
  })

  await createAuditLog({
    action: 'invoice_updated',
    entityType: 'invoice',
    entityId: id,
    description: `Tagihan ${updated.invoiceNumber} diupdate`,
    oldValues: original,
    newValues: updated,
    userId: req.userId,
  })

  return success({ message: 'Invoice updated' })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return error('Invoice not found', 404)

  await prisma.invoice.delete({ where: { id } })

  await createAuditLog({
    action: 'invoice_deleted',
    entityType: 'invoice',
    entityId: id,
    description: `Tagihan ${invoice.invoiceNumber} dihapus`,
    oldValues: invoice,
    userId: req.userId,
  })

  return success({ message: 'Invoice deleted' })
})

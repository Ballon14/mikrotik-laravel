import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all) {
    const data = await prisma.payment.findMany({
      orderBy: { id: 'desc' },
      include: { invoice: { include: { customer: true } } },
    })
    return success(data)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { id: 'desc' },
      skip,
      take: pageSize,
      include: { invoice: { include: { customer: true } } },
    }),
    prisma.payment.count(),
  ])

  return success({
    data,
    currentPage: page,
    lastPage: Math.ceil(total / pageSize),
    total,
  })
})

export const POST = withAuth(async (req) => {
  const body = await getBody(req)
  const { invoice_id, amount, payment_method, reference, notes, paid_at } = body

  if (!invoice_id || amount === undefined) {
    return error('Invoice ID and amount required')
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: parseInt(invoice_id),
      amount: parseFloat(amount),
      paymentMethod: payment_method || null,
      reference: reference || null,
      notes: notes || null,
      paidAt: paid_at ? new Date(paid_at) : new Date(),
    },
    include: { invoice: { include: { customer: true } } },
  })

  // Check if invoice is fully paid
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(invoice_id) },
    include: { payments: true },
  })

  if (invoice) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'paid', paidAt: new Date() },
      })

      // Activate customer if needed
      const customer = await prisma.customer.findUnique({ where: { id: invoice.customerId } })
      if (customer && customer.status !== 'active') {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { status: 'active' },
        })
        // Sync PPPoE
        const accounts = await prisma.pppoeAccount.findMany({ where: { customerId: customer.id } })
        for (const acc of accounts) {
          try {
            const syncService = new PppoeSyncService()
            await syncService.enableOnRouter(acc.username)
          } catch (e) {
            console.error('[Activate]', e.message)
          }
        }
      }
    }
  }

  await createAuditLog({
    action: 'payment_recorded',
    entityType: 'payment',
    entityId: payment.id,
    description: `Pembayaran Rp ${amount} untuk invoice ${invoice?.invoiceNumber || invoice_id}`,
    newValues: payment,
    userId: req.userId,
  })

  return success(payment)
})

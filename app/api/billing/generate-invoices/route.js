import { success, withAuth } from "@/lib/api-utils.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const POST = withAuth(async () => {
  const customers = await prisma.customer.findMany({
    where: { status: 'active' },
    include: { package: true },
  })

  let created = 0
  for (const customer of customers) {
    if (!customer.package) continue

    // Check if last invoice is unpaid
    const lastInvoice = await prisma.invoice.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    })

    if (lastInvoice && lastInvoice.status === 'unpaid') continue

    const now = new Date()
    let periodStart, periodEnd

    if (customer.package.billingPeriod === 'weekly') {
      periodStart = new Date(now)
      periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (customer.package.billingPeriod === 'quarterly') {
      periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 3, 0)
    } else if (customer.package.billingPeriod === 'yearly') {
      periodStart = new Date(now.getFullYear(), 0, 1)
      periodEnd = new Date(now.getFullYear(), 11, 31)
    } else {
      // monthly (default)
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const dueDate = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000)

    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`

    await prisma.invoice.create({
      data: {
        customerId: customer.id,
        invoiceNumber,
        amount: customer.package.price,
        status: 'unpaid',
        dueDate: dueDate.toISOString().split('T')[0],
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
      },
    })

    created++
  }

  return success({ message: `${created} invoice(s) generated`, count: created })
})

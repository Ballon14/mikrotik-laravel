import { success, withAuth } from "@/lib/api-utils.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const POST = withAuth(async () => {
  const now = new Date()
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'unpaid',
      dueDate: {
        lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    },
    include: { customer: true },
  })

  let isolated = 0
  for (const invoice of overdueInvoices) {
    if (invoice.customer && invoice.customer.status !== 'isolated') {
      await prisma.customer.update({
        where: { id: invoice.customer.id },
        data: { status: 'isolated' },
      })

      const accounts = await prisma.pppoeAccount.findMany({
        where: { customerId: invoice.customer.id },
      })

      for (const acc of accounts) {
        try {
          const syncService = new PppoeSyncService()
          await syncService.disableOnRouter(acc.username)
        } catch (e) {
          console.error('[Disable PPPoE]', e.message)
        }
      }

      isolated++
    }
  }

  return success({ message: `${isolated} customer(s) isolated`, count: isolated })
})

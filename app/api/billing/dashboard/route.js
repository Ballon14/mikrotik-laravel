import { success, withAuth } from "@/lib/api-utils.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async () => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [activeCustomers, isolatedCustomers, totalCustomers, monthlyRevenueResult, pendingRevenueResult, recentPayments] = await Promise.all([
    prisma.customer.count({ where: { status: 'active' } }),
    prisma.customer.count({ where: { status: 'isolated' } }),
    prisma.customer.count(),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        status: 'paid',
        paidAt: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'unpaid' },
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { invoice: { include: { customer: true } } },
    }),
  ])

  // Monthly revenue data for the year (single query)
  const monthlyPaid = await prisma.$queryRawUnsafe(`
    SELECT CAST(strftime('%m', paidAt) AS INTEGER) AS month,
           COALESCE(SUM(amount), 0) AS total
    FROM Invoice
    WHERE status = 'paid'
      AND paidAt >= ? AND paidAt < ?
    GROUP BY strftime('%m', paidAt)
  `, new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1))

  const monthlyData = {}
  for (let m = 1; m <= 12; m++) monthlyData[String(m)] = 0
  for (const row of monthlyPaid) monthlyData[String(row.month)] = Number(row.total)

  return success({
    activeCustomers,
    isolatedCustomers,
    totalCustomers,
    monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
    pendingRevenue: pendingRevenueResult._sum.amount || 0,
    recentPayments,
    monthlyData,
  })
})

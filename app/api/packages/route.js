import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all) {
    const data = await prisma.package.findMany({ orderBy: { id: 'desc' } })
    return success(data)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.package.findMany({ orderBy: { id: 'desc' }, skip, take: pageSize }),
    prisma.package.count(),
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
  const { name, price, speed, description, billing_period } = body

  if (!name || price === undefined) return error('Name and price required')

  const pkg = await prisma.package.create({
    data: {
      name,
      price: parseFloat(price),
      speed: speed || null,
      description: description || null,
      billingPeriod: billing_period || 'monthly',
    },
  })

  await createAuditLog({
    action: 'package_created',
    entityType: 'package',
    entityId: pkg.id,
    description: `Paket ${pkg.name} dibuat`,
    newValues: pkg,
    userId: req.userId,
  })

  return success(pkg)
})

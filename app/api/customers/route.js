import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import { PppoeSyncService } from "@/lib/pppoe-sync.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all) {
    const data = await prisma.customer.findMany({
      orderBy: { id: 'desc' },
      include: { package: true, pppoeAccounts: { include: { router: true } } },
    })
    return success(data)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { id: 'desc' },
      skip,
      take: pageSize,
      include: { package: true, pppoeAccounts: { include: { router: true } } },
    }),
    prisma.customer.count(),
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
  const { name, nik, phone, email, address, pppoe_username, pppoe_password, package_id, status } = body

  if (!name || !pppoe_username || !pppoe_password || !package_id) {
    return error('Name, PPPoE username, password, and package are required')
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      nik: nik || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      pppoeUsername: pppoe_username,
      pppoePassword: pppoe_password,
      packageId: parseInt(package_id),
      status: status || 'inactive',
    },
  })

  const account = await prisma.pppoeAccount.create({
    data: {
      customerId: customer.id,
      username: pppoe_username,
      password: pppoe_password,
      service: 'pppoe',
      disabled: status !== 'active',
    },
  })

  if (customer.status === 'active') {
    try {
      const syncService = new PppoeSyncService()
      await syncService.sync(account)
    } catch (e) {
      console.error('[Sync PPPoE]', e.message)
    }
  }

  await createAuditLog({
    action: 'customer_created',
    entityType: 'customer',
    entityId: customer.id,
    description: `Pelanggan ${customer.name} dibuat`,
    newValues: customer,
    userId: req.userId,
  })

  return success(customer)
})

import prisma from './prisma.mjs'

export async function createAuditLog({ action, entityType, entityId, description, oldValues, newValues, userId, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId != null ? Number(entityId) : null,
        description,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        userId: userId || null,
        ipAddress: ipAddress || null,
      },
    })
  } catch (err) {
    console.error('[AuditLog]', err.message)
  }
}

export async function getAuditLogs(page = 1, pageSize = 25) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ])
  return {
    data,
    currentPage: page,
    lastPage: Math.ceil(total / pageSize),
    total,
  }
}

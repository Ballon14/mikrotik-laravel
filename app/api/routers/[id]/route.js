import { success, error, withAuth, getBody } from "@/lib/api-utils.mjs"
import { createAuditLog } from "@/lib/audit.mjs"
import prisma from "@/lib/prisma.mjs"

export const dynamic = 'force-dynamic'

export const PUT = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const body = await getBody(req)
  const original = await prisma.router.findUnique({ where: { id } })
  if (!original) return error('Router not found', 404)

  const data = {
    name: body.name,
    host: body.host,
    port: body.port ? parseInt(body.port) : 8728,
    username: body.username,
    apiPort: body.api_port ? parseInt(body.api_port) : null,
    isActive: body.is_active !== undefined ? Boolean(body.is_active) : original.isActive,
  }

  if (body.password) {
    data.password = body.password
  }

  const updated = await prisma.router.update({ where: { id }, data })

  await createAuditLog({
    action: 'router_updated',
    entityType: 'router',
    entityId: id,
    description: `Router ${updated.name} diupdate`,
    oldValues: { ...original, password: undefined },
    newValues: { ...updated, password: undefined },
    userId: req.userId,
  })

  return success({ ...updated, password: undefined })
})

export const DELETE = withAuth(async (req, { params }) => {
  const id = parseInt(params.id)
  const router = await prisma.router.findUnique({ where: { id } })
  if (!router) return error('Router not found', 404)

  await prisma.router.delete({ where: { id } })

  await createAuditLog({
    action: 'router_deleted',
    entityType: 'router',
    entityId: id,
    description: `Router ${router.name} dihapus`,
    oldValues: { ...router, password: undefined },
    userId: req.userId,
  })

  return success({ message: 'Router deleted' })
})

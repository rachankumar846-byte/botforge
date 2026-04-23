import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function tenantMiddleware(req, res, next) {
  const tenant = await prisma.tenant.findFirst({
    where: { users: { some: { id: req.user.userId } } }
  })
  if (!tenant) return res.status(403).json({ error: 'Tenant not found' })
  req.tenantId = tenant.id
  next()
}
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth.js'
import tenantMiddleware from '../middleware/tenant.js'

const router = Router()
const prisma = new PrismaClient()

// Get all bots for tenant
router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  const bots = await prisma.bot.findMany({
    where: { tenantId: req.tenantId }
  })
  res.json(bots)
})

// Create a bot
router.post('/', authMiddleware, tenantMiddleware, async (req, res) => {
  const { name, systemPrompt, widgetColor } = req.body
  const bot = await prisma.bot.create({
    data: {
      name,
      systemPrompt: systemPrompt || 'You are a helpful assistant.',
      widgetColor: widgetColor || '#7F77DD',
      tenantId: req.tenantId
    }
  })
  res.json(bot)
})

// Update a bot
router.put('/:id', authMiddleware, tenantMiddleware, async (req, res) => {
  const { name, systemPrompt, widgetColor } = req.body
  const bot = await prisma.bot.update({
    where: { id: req.params.id },
    data: { name, systemPrompt, widgetColor }
  })
  res.json(bot)
})

// Delete a bot
router.delete('/:id', authMiddleware, tenantMiddleware, async (req, res) => {
  await prisma.bot.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
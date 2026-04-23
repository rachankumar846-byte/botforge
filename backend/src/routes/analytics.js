import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth.js'
import tenantMiddleware from '../middleware/tenant.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  const bots = await prisma.bot.findMany({
    where: { tenantId: req.tenantId }
  })
  const botIds = bots.map(b => b.id)

  const conversations = await prisma.conversation.findMany({
    where: { botId: { in: botIds } }
  })

  // Total messages
  let totalMessages = 0
  const messagesPerDay = {}
  const botMessageCount = {}

  for (const convo of conversations) {
    const msgs = convo.messages
    totalMessages += msgs.length

    // Count per bot
    botMessageCount[convo.botId] = (botMessageCount[convo.botId] || 0) + msgs.length

    // Count per day
    const day = new Date(convo.startedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    })
    messagesPerDay[day] = (messagesPerDay[day] || 0) + msgs.length
  }

  // Most active bot
  let mostActiveBot = null
  let maxMessages = 0
  for (const bot of bots) {
    const count = botMessageCount[bot.id] || 0
    if (count > maxMessages) {
      maxMessages = count
      mostActiveBot = bot.name
    }
  }

  // Last 7 days chart data
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    last7Days.push({ day: label, messages: messagesPerDay[label] || 0 })
  }

  res.json({
    totalMessages,
    totalConversations: conversations.length,
    totalBots: bots.length,
    mostActiveBot,
    last7Days
  })
})

export default router
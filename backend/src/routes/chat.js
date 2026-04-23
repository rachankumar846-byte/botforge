import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth.js'
import tenantMiddleware from '../middleware/tenant.js'
import { sendMessage } from '../services/claude.js'
import { getRelevantContext } from '../services/rag.js'

const router = Router()
const prisma = new PrismaClient()

// Private route (dashboard test chat)
router.post('/send', authMiddleware, tenantMiddleware, async (req, res) => {
  const { botId, sessionId, message } = req.body

  const bot = await prisma.bot.findFirst({
    where: { id: botId, tenantId: req.tenantId }
  })
  if (!bot) return res.status(404).json({ error: 'Bot not found' })

  let convo = await prisma.conversation.findFirst({ where: { botId, sessionId } })
  if (!convo) {
    convo = await prisma.conversation.create({
      data: { botId, sessionId, messages: [] }
    })
  }

  const history = convo.messages
  history.push({ role: 'user', content: message })

  let reply
  try {
    const context = await getRelevantContext(botId, message)
    reply = await sendMessage({
      systemPrompt: bot.systemPrompt,
      messages: history,
      context
    })
  } catch (err) {
    console.error('AI error:', err.message)
    return res.status(500).json({ error: 'AI service error. Please try again in a moment.' })
  }

  history.push({ role: 'assistant', content: reply })
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { messages: history }
  })

  res.json({ reply })
})

// Public route (embeddable widget)
router.post('/public', async (req, res) => {
  const { botId, sessionId, message } = req.body

  const bot = await prisma.bot.findFirst({ where: { id: botId, isActive: true } })
  if (!bot) return res.status(404).json({ error: 'Bot not found' })

  let convo = await prisma.conversation.findFirst({ where: { botId, sessionId } })
  if (!convo) {
    convo = await prisma.conversation.create({
      data: { botId, sessionId, messages: [] }
    })
  }

  const history = convo.messages
  history.push({ role: 'user', content: message })

  let reply
  try {
    const context = await getRelevantContext(botId, message)
    reply = await sendMessage({
      systemPrompt: bot.systemPrompt,
      messages: history,
      context
    })
  } catch (err) {
    return res.status(500).json({ error: 'AI service error. Please try again.' })
  }

  history.push({ role: 'assistant', content: reply })
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { messages: history }
  })

  res.json({ reply })
})

export default router
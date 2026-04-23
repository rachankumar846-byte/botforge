import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getRelevantContext(botId, userMessage) {
  const docs = await prisma.knowledgeDoc.findMany({
    where: { botId }
  })

  if (docs.length === 0) return ''

  const query = userMessage.toLowerCase()
  const words = query.split(' ').filter(w => w.length > 2)

  let bestDoc = null
  let bestScore = 0

  for (const doc of docs) {
    const content = doc.content.toLowerCase()
    let score = 0
    for (const word of words) {
      const matches = (content.match(new RegExp(word, 'g')) || []).length
      score += matches
    }
    // Always give at least 1 score so docs are never skipped
    if (score >= bestScore) {
      bestScore = score
      bestDoc = doc
    }
  }

  if (!bestDoc) return ''

  // Return first 3000 characters of the best matching doc
  const context = bestDoc.content.slice(0, 3000)

  return `Here is the content from the uploaded document "${bestDoc.filename}":\n\n${context}`
}
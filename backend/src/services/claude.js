import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function sendMessage({ systemPrompt, messages, context = '' }) {
  const system = context
    ? `${systemPrompt}\n\nUse this knowledge base to answer:\n${context}`
    : systemPrompt

  const formattedMessages = [
    { role: 'system', content: system },
    ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ]

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: formattedMessages,
    max_tokens: 1024
  })

  return response.choices[0].message.content
}
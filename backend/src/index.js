import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import botRoutes from './routes/bots.js'
import chatRoutes from './routes/chat.js'
import knowledgeRoutes from './routes/knowledge.js'
import widgetRoutes from './routes/widget.js'
import analyticsRoutes from './routes/analytics.js'

dotenv.config()
const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://botforge-omega.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/bots', botRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/widget', widgetRoutes)

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  // Keep alive ping every 14 minutes to prevent Render free tier sleep
  setInterval(() => {
    fetch(`https://botforge-2k2q.onrender.com/health`)
      .then(() => console.log('Keep alive ping sent'))
      .catch(() => console.log('Keep alive ping failed'))
  }, 14 * 60 * 1000)
})
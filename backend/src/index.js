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
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`)
})
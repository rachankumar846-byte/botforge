import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import authMiddleware from '../middleware/auth.js'
import multer from 'multer'
import fs from 'fs'
import mammoth from 'mammoth'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdf = require('pdf-parse')

const router = Router()
const prisma = new PrismaClient()

const upload = multer({ dest: 'uploads/' })

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { botId } = req.body
  const file = req.file

  if (!file) return res.status(400).json({ error: 'No file uploaded' })

  let content = ''

  try {
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path)
      const data = await pdf(dataBuffer)
      content = data.text

    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ path: file.path })
      content = result.value

    } else {
      content = fs.readFileSync(file.path, 'utf-8')
    }
  } catch (err) {
    console.error('File read error:', err)
    return res.status(400).json({ error: 'Could not read file' })
  } finally {
    try { fs.unlinkSync(file.path) } catch {}
  }

  if (!content.trim()) {
    return res.status(400).json({ error: 'File appears to be empty' })
  }

  const doc = await prisma.knowledgeDoc.create({
    data: { botId, filename: file.originalname, content }
  })

  res.json(doc)
})

router.get('/:botId', authMiddleware, async (req, res) => {
  const docs = await prisma.knowledgeDoc.findMany({
    where: { botId: req.params.botId },
    select: { id: true, filename: true, uploadedAt: true }
  })
  res.json(docs)
})

router.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.knowledgeDoc.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
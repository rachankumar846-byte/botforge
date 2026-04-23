import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
  const { name, email, password, companyName } = req.body
  const passwordHash = await bcrypt.hash(password, 10)

  const tenant = await prisma.tenant.create({
    data: {
      name: companyName,
      slug: companyName.toLowerCase().replace(/\s+/g, '-'),
      users: { create: { name, email, passwordHash } }
    },
    include: { users: true }
  })

  const token = jwt.sign(
    { userId: tenant.users[0].id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

export default router
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/register', async (req, res) => {
  const { name, email, password, companyName } = req.body

  // Validation
  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
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
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

export default router
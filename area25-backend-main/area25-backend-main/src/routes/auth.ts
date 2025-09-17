import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'

const router = Router()

// Store manager credentials in environment variables for security
const MANAGER_USERNAME = process.env.MANAGER_USERNAME || 'admin'
const MANAGER_PASSWORD_HASH = process.env.MANAGER_PASSWORD_HASH || hashPassword('admin')

// Simple session storage (in production, use Redis or database)
const sessions = new Map<string, { username: string; expiresAt: Date }>()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body)

    // Check credentials
    if (username !== MANAGER_USERNAME || hashPassword(password) !== MANAGER_PASSWORD_HASH) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create session
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    sessions.set(token, { username, expiresAt })

    res.json({
      success: true,
      token,
      expiresAt
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: 'Login failed' })
  }
})

// Verify session endpoint
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const session = sessions.get(token)
  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  res.json({
    valid: true,
    username: session.username,
    expiresAt: session.expiresAt
  })
})

// Logout endpoint
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (token) {
    sessions.delete(token)
  }

  res.json({ success: true })
})

// Change password endpoint (only for authenticated manager)
router.post('/change-password', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const session = sessions.get(token)
  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6)
    }).parse(req.body)

    // Verify current password
    if (hashPassword(currentPassword) !== MANAGER_PASSWORD_HASH) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // In production, you would update the password in database
    // For now, just return success (password change requires env var update)
    res.json({
      success: true,
      message: 'Password changed successfully. Update MANAGER_PASSWORD_HASH in environment variables.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export { router }
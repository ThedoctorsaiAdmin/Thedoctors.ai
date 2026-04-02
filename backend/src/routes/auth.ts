import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// ── Helper: generate tokens ──
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  )
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

// ── POST /api/auth/verify-clinic ──
// Step 1: Verify clinic code
router.post('/verify-clinic', async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ success: false, message: 'Clinic code required' })

    // Super admin check
    if (code.toUpperCase() === 'SADMIN') {
      return res.json({
        success: true,
        isSuperAdmin: true,
        clinic: { name: 'Super Admin Portal', code: 'SADMIN' }
      })
    }

    const clinic = await prisma.clinic.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true, code: true, name: true, city: true, state: true,
        status: true, plan: { select: { name: true } }
      }
    })

    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic code not found. Please check and try again.' })
    }

    if (clinic.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This clinic account is suspended. Please contact support.' })
    }

    res.json({ success: true, clinic })
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
  }
})

// ── POST /api/auth/login ──
// Step 2: Login with email + password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { clinicCode, email, password } = req.body

    // Find clinic
    const clinic = await prisma.clinic.findUnique({
      where: { code: clinicCode.toUpperCase() }
    })
    if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' })

    // Find user in this clinic
    const user = await prisma.user.findFirst({
      where: { clinicId: clinic.id, email: email.toLowerCase() }
    })
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your clinic administrator.'
      })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        clinicId: user.clinicId,
        clinicCode: clinic.code,
        clinicName: clinic.name
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
  }
})

// ── POST /api/auth/superadmin/login ──
router.post('/superadmin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const admin = await prisma.superAdmin.findUnique({ where: { email } })
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const accessToken = jwt.sign(
      { userId: admin.id, role: 'superadmin', name: admin.name },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    res.json({
      success: true,
      accessToken,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
  }
})

// ── POST /api/auth/refresh ──
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' })

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role)

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    res.json({ success: true, accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' })
  }
})

// ── POST /api/auth/logout ──
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
  }
})

// ── GET /api/auth/me ──
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, role: true,
        permissions: true, designation: true, specialisation: true,
        phone: true, avatarUrl: true, clinicId: true,
        clinic: { select: { code: true, name: true, plan: { select: { name: true } } } }
      }
    })
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
  }
})

export default router



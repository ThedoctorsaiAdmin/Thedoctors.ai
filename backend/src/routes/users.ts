import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

// ── GET /api/users ── List all users in clinic
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { clinicId: req.clinicId },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        specialisation: true, phone: true, permissions: true,
        isActive: true, deactivatedAt: true, deactivationReason: true,
        lastLoginAt: true, createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ success: true, users })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/users ── Create new user (Admin only)
router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, designation, specialisation, phone, permissions } = req.body

    // Check email unique in clinic
    const exists = await prisma.user.findFirst({
      where: { clinicId: req.clinicId, email: email.toLowerCase() }
    })
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists in this clinic' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        clinicId: req.clinicId!,
        name, email: email.toLowerCase(), password: hashed,
        role, designation, specialisation, phone,
        permissions: permissions || getDefaultPermissions(role)
      }
    })

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── PUT /api/users/:id ── Update user
router.put('/:id', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { password, ...data } = req.body
    if (password) data.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data
    })
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── PUT /api/users/:id/permissions ── Update permissions
router.put('/:id/permissions', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: { permissions: req.body.permissions }
    })
    res.json({ success: true, message: 'Permissions updated. Effective at next login.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/users/:id/deactivate ── Deactivate user
router.post('/:id/deactivate', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body
    if (!reason) return res.status(400).json({ success: false, message: 'Reason required' })

    const targetUser = await prisma.user.findFirst({
      where: { id: req.params.id, clinicId: req.clinicId }
    })
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' })

    // Cannot deactivate yourself
    if (targetUser.id === req.user!.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' })
    }

    // Cannot deactivate last admin
    if (targetUser.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { clinicId: req.clinicId, role: 'admin', isActive: true }
      })
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last admin. Please assign another admin first.'
        })
      }
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: req.user!.id,
        deactivationReason: reason
      }
    })

    // Invalidate all refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: req.params.id } })

    res.json({ success: true, message: `${targetUser.name} has been deactivated. Audit log updated.` })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/users/:id/reactivate ── Reactivate user
router.post('/:id/reactivate', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: { isActive: true, deactivatedAt: null, deactivationReason: null }
    })
    res.json({ success: true, message: 'User reactivated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── Default permissions by role ──
function getDefaultPermissions(role: string) {
  const all = { view: true, edit: true, create: true }
  const viewOnly = { view: true, edit: false, create: false }
  const none = { view: false, edit: false, create: false }

  const defaults: Record<string, any> = {
    admin: {
      dashboard: all, appointments: all, queue: all, patients: all,
      consultation: all, pharmacy: all, stock: all, ipd: all,
      lab: all, insurance: all, accounts: all, users: all,
      reports: all, settings: all, ot: all, gst: all
    },
    doctor: {
      dashboard: viewOnly, appointments: all, queue: all, patients: all,
      consultation: all, pharmacy: viewOnly, stock: none, ipd: all,
      lab: all, insurance: viewOnly, accounts: none, users: none,
      reports: viewOnly, settings: none, ot: all, gst: none
    },
    receptionist: {
      dashboard: viewOnly, appointments: all, queue: all, patients: all,
      consultation: none, pharmacy: none, stock: none, ipd: none,
      lab: none, insurance: none, accounts: viewOnly, users: none,
      reports: none, settings: none, ot: none, gst: none
    },
    pharmacist: {
      dashboard: none, appointments: none, queue: viewOnly, patients: viewOnly,
      consultation: none, pharmacy: all, stock: all, ipd: none,
      lab: none, insurance: none, accounts: none, users: none,
      reports: viewOnly, settings: none, ot: none, gst: none
    },
    nurse: {
      dashboard: none, appointments: none, queue: all, patients: viewOnly,
      consultation: viewOnly, pharmacy: none, stock: none, ipd: viewOnly,
      lab: viewOnly, insurance: none, accounts: none, users: none,
      reports: none, settings: none, ot: none, gst: none
    },
    accountant: {
      dashboard: viewOnly, appointments: none, queue: none, patients: none,
      consultation: none, pharmacy: none, stock: none, ipd: none,
      lab: none, insurance: all, accounts: all, users: none,
      reports: all, settings: none, ot: none, gst: all
    }
  }

  return defaults[role] || defaults.receptionist
}

export default router

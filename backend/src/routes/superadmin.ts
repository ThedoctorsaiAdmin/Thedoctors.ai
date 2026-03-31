import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateSuperAdmin, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticateSuperAdmin)

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [clinics, patients, revenue] = await Promise.all([
      prisma.clinic.count(),
      prisma.patient.count(),
      prisma.accountEntry.aggregate({ where: { isCredit: true }, _sum: { amount: true } })
    ])
    res.json({ success: true, stats: { clinics, patients, revenue: revenue._sum.amount || 0 } })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/clinics', async (req: AuthRequest, res: Response) => {
  try {
    const clinics = await prisma.clinic.findMany({
      include: { plan: true, _count: { select: { users: true, patients: true } } }
    })
    res.json({ success: true, clinics })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/clinics/:id/suspend', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.clinic.update({ where: { id: req.params.id }, data: { status: 'suspended' } })
    res.json({ success: true, message: 'Clinic suspended' })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/clinics/:id/activate', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.clinic.update({ where: { id: req.params.id }, data: { status: 'active' } })
    res.json({ success: true, message: 'Clinic activated' })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.plan.findMany()
    res.json({ success: true, plans })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

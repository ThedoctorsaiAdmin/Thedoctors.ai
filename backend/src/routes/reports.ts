import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const [patients, consultations, revenue, claims] = await Promise.all([
      prisma.patient.count({ where: { clinicId: req.clinicId } }),
      prisma.consultation.count({ where: { clinicId: req.clinicId } }),
      prisma.accountEntry.aggregate({ where: { clinicId: req.clinicId, isCredit: true }, _sum: { amount: true } }),
      prisma.insuranceClaim.count({ where: { clinicId: req.clinicId } })
    ])
    res.json({ success: true, overview: { patients, consultations, revenue: revenue._sum.amount || 0, claims } })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/doctors', async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { clinicId: req.clinicId, role: { in: ['admin', 'doctor'] }, isActive: true },
      select: { id: true, name: true, designation: true, specialisation: true, _count: { select: { consultations: true } } }
    })
    res.json({ success: true, doctors })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

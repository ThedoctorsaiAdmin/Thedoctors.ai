import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.clinicId },
      include: { plan: true, services: { where: { isActive: true } } }
    })
    res.json({ success: true, clinic })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.put('/me', async (req: AuthRequest, res: Response) => {
  try {
    const clinic = await prisma.clinic.update({ where: { id: req.clinicId }, data: req.body })
    res.json({ success: true, clinic })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

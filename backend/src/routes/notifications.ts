import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { clinicId: req.clinicId, OR: [{ userId: req.user!.id }, { userId: null }] },
      orderBy: { createdAt: 'desc' }, take: 50
    })
    res.json({ success: true, notifications })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: { isRead: true } })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { clinicId: req.clinicId }, data: { isRead: true } })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

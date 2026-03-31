import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.stockItem.findMany({
      where: { clinicId: req.clinicId }, orderBy: { name: 'asc' },
      include: { vendor: { select: { name: true } } }
    })
    res.json({ success: true, items })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/vendors', async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({ where: { clinicId: req.clinicId } })
    res.json({ success: true, vendors })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.stockItem.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, item })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.stockItem.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: req.body })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

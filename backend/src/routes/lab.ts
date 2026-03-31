import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' },
      include: { patient: { select: { name: true, patientCode: true } } }
    })
    res.json({ success: true, orders })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.labOrder.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const labNumber = `LAB/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const order = await prisma.labOrder.create({ data: { ...req.body, clinicId: req.clinicId, labNumber, doctorId: req.user!.id } })
    res.status(201).json({ success: true, order })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.labOrder.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: req.body })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

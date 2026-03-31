import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date, doctorId, status } = req.query
    const where: any = { clinicId: req.clinicId }
    if (doctorId) where.doctorId = doctorId
    if (status) where.status = status
    const appointments = await prisma.appointment.findMany({
      where, orderBy: { date: 'asc' },
      include: {
        patient: { select: { name: true, phone: true, patientCode: true } },
        doctor: { select: { name: true } }
      }
    })
    res.json({ success: true, appointments })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const appt = await prisma.appointment.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, appointment: appt })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.appointment.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: { status: req.body.status }
    })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

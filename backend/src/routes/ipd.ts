import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const admissions = await prisma.ipdAdmission.findMany({
      where: { clinicId: req.clinicId, status: 'active' },
      include: { patient: { select: { name: true, patientCode: true, phone: true } }, progressNotes: { orderBy: { date: 'desc' } } }
    })
    res.json({ success: true, admissions })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/admit', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.ipdAdmission.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const ipdNumber = `IPD/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const admission = await prisma.ipdAdmission.create({ data: { ...req.body, clinicId: req.clinicId, ipdNumber } })
    res.status(201).json({ success: true, admission })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/:id/notes', async (req: AuthRequest, res: Response) => {
  try {
    const admission = await prisma.ipdAdmission.findFirst({ where: { id: req.params.id, clinicId: req.clinicId } })
    if (!admission) return res.status(404).json({ success: false, message: 'Not found' })
    const existing = await prisma.ipdProgressNote.count({ where: { admissionId: req.params.id } })
    const note = await prisma.ipdProgressNote.create({
      data: { ...req.body, admissionId: req.params.id, doctorId: req.user!.id, day: existing + 1 }
    })
    res.status(201).json({ success: true, note })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/:id/discharge', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.ipdAdmission.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: { ...req.body, status: 'discharged', dischargedAt: new Date() }
    })
    res.json({ success: true, message: 'Patient discharged' })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

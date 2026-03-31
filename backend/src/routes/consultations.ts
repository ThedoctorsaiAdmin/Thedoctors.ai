import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

// Generate OPD number
const generateOpdNumber = () => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `OPD/${yy}/${mm}/${seq}`
}

// ── GET /api/consultations ──
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, date, page = '1', limit = '20' } = req.query
    const where: any = { clinicId: req.clinicId }
    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId

    const consultations = await prisma.consultation.findMany({
      where,
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { name: true, patientCode: true, phone: true } },
        doctor: { select: { name: true } },
        prescription: true
      }
    })
    res.json({ success: true, consultations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/consultations ── Start new consultation
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const opdNumber = generateOpdNumber()
    const consultation = await prisma.consultation.create({
      data: { ...req.body, clinicId: req.clinicId, opdNumber }
    })
    res.status(201).json({ success: true, consultation })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── PUT /api/consultations/:id ── Update consultation fields
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const consultation = await prisma.consultation.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: req.body
    })
    res.json({ success: true, consultation })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/consultations/:id/verify ── Doctor verifies AI data
router.post('/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const consultation = await prisma.consultation.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user!.id,
        status: 'completed',
        completedAt: new Date()
      }
    })
    // TODO: trigger WhatsApp prescription send when WATI_API_KEY is set
    res.json({ success: true, message: 'Consultation verified', consultation })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/consultations/:id/prescription ── Create prescription
router.post('/:id/prescription', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.prescription.count({ where: { clinicId: req.clinicId } })
    const rxNumber = `RX-${String(count + 1).padStart(4, '0')}`

    const prescription = await prisma.prescription.create({
      data: {
        ...req.body,
        clinicId: req.clinicId,
        rxNumber,
        consultationId: req.params.id
      }
    })
    res.status(201).json({ success: true, prescription })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router

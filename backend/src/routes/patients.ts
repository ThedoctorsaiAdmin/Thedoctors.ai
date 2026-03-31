import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// All routes require authentication
router.use(authenticate)

// ── GET /api/patients ── List all patients
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = { clinicId: req.clinicId }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { patientCode: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where, skip, take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ])

    res.json({ success: true, patients, total, page: parseInt(page as string) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── GET /api/patients/:id ── Single patient with history
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.id, clinicId: req.clinicId },
      include: {
        consultations: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { prescription: true }
        },
        pharmacyOrders: { orderBy: { createdAt: 'desc' }, take: 5 },
        ipdAdmissions: { orderBy: { admittedAt: 'desc' }, take: 5 },
        insuranceClaims: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    })
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' })
    res.json({ success: true, patient })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── POST /api/patients ── Create patient
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const clinic = await prisma.clinic.findUnique({ where: { id: req.clinicId } })
    const count = await prisma.patient.count({ where: { clinicId: req.clinicId } })
    const patientCode = `${clinic?.code?.split('-')[0] || 'PT'}-${String(count + 1).padStart(4, '0')}`

    const patient = await prisma.patient.create({
      data: { ...req.body, clinicId: req.clinicId, patientCode }
    })
    res.status(201).json({ success: true, patient })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ── PUT /api/patients/:id ── Update patient
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const patient = await prisma.patient.updateMany({
      where: { id: req.params.id, clinicId: req.clinicId },
      data: req.body
    })
    res.json({ success: true, patient })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router

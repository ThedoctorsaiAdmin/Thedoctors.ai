import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/claims', async (req: AuthRequest, res: Response) => {
  try {
    const claims = await prisma.insuranceClaim.findMany({
      where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' },
      include: { patient: { select: { name: true, patientCode: true } }, insuranceCompany: true }
    })
    res.json({ success: true, claims })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/claims', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.insuranceClaim.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const claimNumber = `CLM/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const claim = await prisma.insuranceClaim.create({ data: { ...req.body, clinicId: req.clinicId, claimNumber } })
    res.status(201).json({ success: true, claim })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.put('/claims/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.insuranceClaim.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: req.body })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/companies', async (req: AuthRequest, res: Response) => {
  try {
    const companies = await prisma.insuranceCompany.findMany({ where: { clinicId: req.clinicId } })
    res.json({ success: true, companies })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/companies', async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.insuranceCompany.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, company })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

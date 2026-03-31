import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query
    const entries = await prisma.accountEntry.findMany({
      where: { clinicId: req.clinicId },
      orderBy: { date: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    })
    const stats = await prisma.accountEntry.aggregate({
      where: { clinicId: req.clinicId, isCredit: true },
      _sum: { amount: true }
    })
    res.json({ success: true, entries, totalRevenue: stats._sum.amount || 0 })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const entry = await prisma.accountEntry.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, entry })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.get('/invoices', async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' } })
    res.json({ success: true, invoices })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

router.post('/invoices', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.invoice.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const invoiceNumber = `INV/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const invoice = await prisma.invoice.create({ data: { ...req.body, clinicId: req.clinicId, invoiceNumber } })
    res.status(201).json({ success: true, invoice })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

export default router

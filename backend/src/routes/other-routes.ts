import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'
export const labRouter = Router()
export const insuranceRouter = Router()
export const accountsRouter = Router()
export const reportsRouter = Router()
export const notificationsRouter = Router()
export const clinicsRouter = Router()
const prisma = new PrismaClient()

// ── LAB ──
labRouter.use(authenticate)
labRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' },
      include: { patient: { select: { name: true } } }
    })
    res.json({ success: true, orders })
  } catch { res.status(500).json({ success: false }) }
})
labRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.labOrder.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const labNumber = `LAB/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const order = await prisma.labOrder.create({ data: { ...req.body, clinicId: req.clinicId, labNumber, doctorId: req.user!.id } })
    res.status(201).json({ success: true, order })
  } catch { res.status(500).json({ success: false }) }
})
labRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.labOrder.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: req.body })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false }) }
})

// ── INSURANCE ──
insuranceRouter.use(authenticate)
insuranceRouter.get('/claims', async (req: AuthRequest, res: Response) => {
  try {
    const claims = await prisma.insuranceClaim.findMany({
      where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' },
      include: { patient: { select: { name: true } } }
    })
    res.json({ success: true, claims })
  } catch { res.status(500).json({ success: false }) }
})
insuranceRouter.post('/claims', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.insuranceClaim.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const claimNumber = `CLM/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const claim = await prisma.insuranceClaim.create({ data: { ...req.body, clinicId: req.clinicId, claimNumber } })
    res.status(201).json({ success: true, claim })
  } catch { res.status(500).json({ success: false }) }
})
insuranceRouter.put('/claims/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.insuranceClaim.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: req.body })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false }) }
})
insuranceRouter.get('/companies', async (req: AuthRequest, res: Response) => {
  try {
    const companies = await prisma.insuranceCompany.findMany({ where: { clinicId: req.clinicId } })
    res.json({ success: true, companies })
  } catch { res.status(500).json({ success: false }) }
})
insuranceRouter.post('/companies', async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.insuranceCompany.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, company })
  } catch { res.status(500).json({ success: false }) }
})

// ── ACCOUNTS ──
accountsRouter.use(authenticate)
accountsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.accountEntry.findMany({
      where: { clinicId: req.clinicId }, orderBy: { date: 'desc' }, take: 100
    })
    res.json({ success: true, entries })
  } catch { res.status(500).json({ success: false }) }
})
accountsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const entry = await prisma.accountEntry.create({ data: { ...req.body, clinicId: req.clinicId } })
    res.status(201).json({ success: true, entry })
  } catch { res.status(500).json({ success: false }) }
})
accountsRouter.get('/invoices', async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ where: { clinicId: req.clinicId }, orderBy: { createdAt: 'desc' } })
    res.json({ success: true, invoices })
  } catch { res.status(500).json({ success: false }) }
})
accountsRouter.post('/invoices', async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.invoice.count({ where: { clinicId: req.clinicId } })
    const now = new Date()
    const invoiceNumber = `INV/${String(now.getFullYear()).slice(2)}/${String(now.getMonth()+1).padStart(2,'0')}/${String(count+1).padStart(4,'0')}`
    const invoice = await prisma.invoice.create({ data: { ...req.body, clinicId: req.clinicId, invoiceNumber } })
    res.status(201).json({ success: true, invoice })
  } catch { res.status(500).json({ success: false }) }
})

// ── REPORTS ──
reportsRouter.use(authenticate)
reportsRouter.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const [totalPatients, totalConsultations, totalClaims] = await Promise.all([
      prisma.patient.count({ where: { clinicId: req.clinicId } }),
      prisma.consultation.count({ where: { clinicId: req.clinicId } }),
      prisma.insuranceClaim.count({ where: { clinicId: req.clinicId } }),
    ])
    res.json({ success: true, data: { totalPatients, totalConsultations, totalClaims } })
  } catch { res.status(500).json({ success: false }) }
})

// ── NOTIFICATIONS ──
notificationsRouter.use(authenticate)
notificationsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { clinicId: req.clinicId, userId: req.user!.id },
      orderBy: { createdAt: 'desc' }, take: 50
    })
    res.json({ success: true, notifications })
  } catch { res.status(500).json({ success: false }) }
})
notificationsRouter.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, clinicId: req.clinicId }, data: { isRead: true } })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false }) }
})

// ── CLINICS (registration) ──
clinicsRouter.post('/register', async (req: any, res: Response) => {
  try {
    const { clinicName, city, adminName, adminEmail, adminPassword, planId, codePrefix } = req.body
    const existing = await prisma.clinic.findFirst({ where: { code: { startsWith: codePrefix.toUpperCase() } } })
    const count = await prisma.clinic.count()
    const code = `${codePrefix.toUpperCase()}-${String(count + 1000).padStart(4,'0')}`
    const clinic = await prisma.clinic.create({
      data: { code, name: clinicName, city, status: 'trial', planId: planId || 'plan-starter' }
    })
    const bcrypt = require('bcryptjs')
    const hashed = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: { clinicId: clinic.id, name: adminName, email: adminEmail.toLowerCase(), password: hashed, role: 'admin', permissions: {} }
    })
    res.status(201).json({ success: true, clinicCode: code, message: 'Registration submitted. Awaiting admin approval.' })
  } catch { res.status(500).json({ success: false, message: 'Server error' }) }
})

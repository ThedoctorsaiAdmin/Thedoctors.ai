import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import clinicRoutes from './routes/clinics'
import patientRoutes from './routes/patients'
import appointmentRoutes from './routes/appointments'
import consultationRoutes from './routes/consultations'
import pharmacyRoutes from './routes/pharmacy'
import stockRoutes from './routes/stock'
import ipdRoutes from './routes/ipd'
import labRoutes from './routes/lab'
import insuranceRoutes from './routes/insurance'
import accountRoutes from './routes/accounts'
import userRoutes from './routes/users'
import reportRoutes from './routes/reports'
import notificationRoutes from './routes/notifications'
import superadminRoutes from './routes/superadmin'
import aiRoutes from './routes/ai'

const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TheDoctors.Ai API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// ── Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/clinics', clinicRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/consultations', consultationRoutes)
app.use('/api/pharmacy', pharmacyRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/ipd', ipdRoutes)
app.use('/api/lab', labRoutes)
app.use('/api/insurance', insuranceRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/superadmin', superadminRoutes)
app.use('/api/ai', aiRoutes)          // AI routes — work with or without API key

// ── Error handler ──
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   TheDoctors.Ai API — Running      ║
  ║   http://localhost:${PORT}            ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚════════════════════════════════════╝
  `)
})

export default app

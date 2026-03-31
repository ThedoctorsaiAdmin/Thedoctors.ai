import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: string
    clinicId: string
    email: string
    role: string
    permissions: any
    name: string
  }
  clinicId?: string
}

// ── Verify JWT token ──
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        clinicId: true,
        email: true,
        role: true,
        permissions: true,
        name: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated. Please contact your clinic administrator.'
      })
    }

    req.user = user as any
    req.clinicId = user.clinicId
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

// ── Super Admin auth ──
export const authenticateSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super admin access required' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// ── Role check ──
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    next()
  }
}

// ── Permission check ──
export const requirePermission = (module: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    // Admin has all permissions
    if (req.user.role === 'admin') return next()

    const perms = req.user.permissions as any
    if (!perms?.[module]?.[action]) {
      return res.status(403).json({
        success: false,
        message: `You don't have ${action} permission for ${module}`
      })
    }
    next()
  }
}

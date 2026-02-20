import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UNAUTHORIZED } from '../helpers/httpStatusCodes'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
    username: string
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(UNAUTHORIZED).json({ error: 'Authentication token required' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string }
    req.userId = decoded.userId
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    }
    next()
  } catch (error) {
    res.status(UNAUTHORIZED).json({ error: 'Invalid or expired token' })
  }
}

export const generateToken = (userId: string, email: string, username: string): string => {
  return jwt.sign({ userId, email, username }, JWT_SECRET, { expiresIn: '7d' })
}

import { ExpressContext } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

export interface GraphQLContext {
  userId?: string
  user?: {
    id: string
    email: string
    username: string
  }
}

export const createContext = async ({ req }: ExpressContext): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return {}
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; username: string }
    return {
      userId: decoded.userId,
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
      },
    }
  } catch (error) {
    return {}
  }
}

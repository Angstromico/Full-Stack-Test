import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from '../helpers/httpStatusCodes'

export interface AuthRequest extends Request {
  auth?: {
    payload: {
      sub: string
      email?: string
      name?: string
      nickname?: string
    }
  }
}

export const registerUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    const { name, email } = req.body

    if (!name || !email) {
      res.status(BAD_REQUEST).json({ error: 'Name and email are required' })
      return
    }

    // Extract username from email or use nickname from Auth0
    const username =
      req.body.username || auth0Payload.nickname || email.split('@')[0]

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { auth0Id: auth0Payload.sub },
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    })

    if (existingUser) {
      res.status(BAD_REQUEST).json({
        error: 'User already exists with this email, username, or Auth0 ID',
      })
      return
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      auth0Id: auth0Payload.sub,
    })

    await user.save()

    res.status(CREATED).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Register user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to register user' })
  }
}

export const loginUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id: auth0Payload.sub })

    if (!user) {
      res
        .status(NOT_FOUND)
        .json({ error: 'User not found. Please register first.' })
      return
    }

    res.status(OK).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Login user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to login user' })
  }
}

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    const user = await User.findOne({ auth0Id: auth0Payload.sub })

    if (!user) {
      res.status(NOT_FOUND).json({ error: 'User not found' })
      return
    }

    res.status(OK).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to get user' })
  }
}

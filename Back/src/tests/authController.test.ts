import { registerUser } from '../controllers/authController'
import { User } from 'models/User'
import { CREATED, BAD_REQUEST } from '../helpers/httpStatusCodes'
import { Request, Response } from 'express'

jest.mock('../models/User')

describe('Unit Test: registerUser Controller', () => {
  let mockReq: Partial<Request> | any
  let mockRes: Partial<Response> | any
  let next: any = jest.fn()

  beforeEach(() => {
    mockReq = {
      auth: { payload: { sub: 'auth0|123', nickname: 'manueldev' } },
      body: { name: 'Manuel Morales', email: 'test@gmail.com' },
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  it('You should be able to register a user successfully if one does not exist.', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    const savedUser = {
      _id: 'mock-id',
      name: 'Manuel Morales',
      email: 'test@gmail.com',
      username: 'manueldev',
      save: jest.fn().mockResolvedValue(true),
    }

    ;(User as unknown as jest.Mock).mockImplementation(() => savedUser)

    await registerUser(mockReq, mockRes, next)

    expect(mockRes.status).toHaveBeenCalledWith(CREATED)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@gmail.com' }),
    )
  })

  it('It should fail if the user already exists.', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue({ email: 'test@gmail.com' })

    await registerUser(mockReq, mockRes, next)

    expect(mockRes.status).toHaveBeenCalledWith(BAD_REQUEST)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'User already exists with this email, username, or Auth0 ID',
    })
  })
})

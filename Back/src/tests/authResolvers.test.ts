import mongoose from 'mongoose'
import { User } from '../models/User'
import { resolvers, GraphQLContext } from '../graphql/resolvers'

// Mock the dependencies
jest.mock('../models/User')
jest.mock('../helpers/utils', () => ({
  generateRandomId: jest.fn(() => 'mock-random-id'),
}))

jest.mock('../middleware/auth', () => ({
  generateToken: jest.fn((userId, email, username) => 'mock-jwt-token'),
}))

const MockedUser = User as jest.Mocked<typeof User>

describe('GraphQL Auth Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerUser mutation', () => {
    const mockUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    }

    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: mockUserData.name,
        email: mockUserData.email,
        username: mockUserData.username,
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(undefined),
      }

      MockedUser.findOne.mockResolvedValue(null)
      MockedUser.mockImplementation(() => mockUser as any)

      const result = await resolvers.Mutation.registerUser(
        null,
        mockUserData,
        {} as GraphQLContext,
      )

      expect(MockedUser.findOne).toHaveBeenCalledWith({
        $or: [
          { email: mockUserData.email.toLowerCase() },
          { username: mockUserData.username.toLowerCase() },
        ],
      })

      expect(mockUser.save).toHaveBeenCalled()
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser._id.toString(),
          name: mockUserData.name,
          email: mockUserData.email.toLowerCase(),
          username: mockUserData.username.toLowerCase(),
        },
      })
    })

    it('should register user with email as username when username not provided', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: mockUserData.name,
        email: mockUserData.email,
        username: 'john', // email part before @
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(undefined),
      }

      MockedUser.findOne.mockResolvedValue(null)
      MockedUser.mockImplementation(() => mockUser as any)

      const result = await resolvers.Mutation.registerUser(
        null,
        {
          name: mockUserData.name,
          email: mockUserData.email,
          password: mockUserData.password,
          // username not provided
        },
        {} as GraphQLContext,
      )

      expect(MockedUser.findOne).toHaveBeenCalledWith({
        $or: [
          { email: mockUserData.email.toLowerCase() },
          { username: 'john' },
        ],
      })

      expect(result.user.username).toBe('john')
    })

    it('should throw error when user already exists with email', async () => {
      const existingUser = {
        email: mockUserData.email,
        username: 'different-username',
      }

      MockedUser.findOne.mockResolvedValue(existingUser as any)

      await expect(
        resolvers.Mutation.registerUser(null, mockUserData, {} as GraphQLContext),
      ).rejects.toThrow('User already exists with this email or username')
    })

    it('should throw error when user already exists with username', async () => {
      const existingUser = {
        email: 'different@example.com',
        username: mockUserData.username,
      }

      MockedUser.findOne.mockResolvedValue(existingUser as any)

      await expect(
        resolvers.Mutation.registerUser(null, mockUserData, {} as GraphQLContext),
      ).rejects.toThrow('User already exists with this email or username')
    })

    it('should convert email and username to lowercase', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: mockUserData.name,
        email: 'john@example.com',
        username: 'johndoe',
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(undefined),
      }

      MockedUser.findOne.mockResolvedValue(null)
      MockedUser.mockImplementation(() => mockUser as any)

      await resolvers.Mutation.registerUser(
        null,
        {
          name: mockUserData.name,
          email: 'John@EXAMPLE.com',
          username: 'JohnDoe',
          password: mockUserData.password,
        },
        {} as GraphQLContext,
      )

      expect(MockedUser.findOne).toHaveBeenCalledWith({
        $or: [
          { email: 'john@example.com' },
          { username: 'johndoe' },
        ],
      })
    })
  })

  describe('loginUser mutation', () => {
    const mockLoginData = {
      emailOrUsername: 'john@example.com',
      password: 'password123',
    }

    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'hashed-password',
      comparePassword: jest.fn(),
    }

    it('should login user successfully with email', async () => {
      mockUser.comparePassword.mockResolvedValue(true)
      
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      })
      MockedUser.findOne = mockFindOne

      const result = await resolvers.Mutation.loginUser(
        null,
        mockLoginData,
        {} as GraphQLContext,
      )

      expect(mockFindOne).toHaveBeenCalledWith({
        $or: [
          { email: mockLoginData.emailOrUsername.toLowerCase() },
          { username: mockLoginData.emailOrUsername.toLowerCase() },
        ],
      })

      expect(mockFindOne().select).toHaveBeenCalledWith('+password')
      expect(mockUser.comparePassword).toHaveBeenCalledWith(mockLoginData.password)
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser._id.toString(),
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
        },
      })
    })

    it('should login user successfully with username', async () => {
      mockUser.comparePassword.mockResolvedValue(true)
      
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      })
      MockedUser.findOne = mockFindOne

      const result = await resolvers.Mutation.loginUser(
        null,
        {
          emailOrUsername: 'johndoe',
          password: 'password123',
        },
        {} as GraphQLContext,
      )

      expect(mockFindOne).toHaveBeenCalledWith({
        $or: [
          { email: 'johndoe' },
          { username: 'johndoe' },
        ],
      })

      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser._id.toString(),
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
        },
      })
    })

    it('should throw error when user not found', async () => {
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      })
      MockedUser.findOne = mockFindOne

      await expect(
        resolvers.Mutation.loginUser(null, mockLoginData, {} as GraphQLContext),
      ).rejects.toThrow('Invalid email/username or password')
    })

    it('should throw error when password is invalid', async () => {
      mockUser.comparePassword.mockResolvedValue(false)
      
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      })
      MockedUser.findOne = mockFindOne

      await expect(
        resolvers.Mutation.loginUser(null, mockLoginData, {} as GraphQLContext),
      ).rejects.toThrow('Invalid email/username or password')
    })

    it('should convert emailOrUsername to lowercase', async () => {
      mockUser.comparePassword.mockResolvedValue(true)
      
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      })
      MockedUser.findOne = mockFindOne

      await resolvers.Mutation.loginUser(
        null,
        {
          emailOrUsername: 'John@EXAMPLE.com',
          password: 'password123',
        },
        {} as GraphQLContext,
      )

      expect(mockFindOne).toHaveBeenCalledWith({
        $or: [
          { email: 'john@example.com' },
          { username: 'john@example.com' },
        ],
      })
    })

    it('should include password field in query', async () => {
      mockUser.comparePassword.mockResolvedValue(true)
      
      const mockFindOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      })
      MockedUser.findOne = mockFindOne

      await resolvers.Mutation.loginUser(null, mockLoginData, {} as GraphQLContext)

      expect(mockFindOne).toHaveBeenCalledWith(
        {
          $or: [
            { email: mockLoginData.emailOrUsername.toLowerCase() },
            { username: mockLoginData.emailOrUsername.toLowerCase() },
          ],
        },
      )
      expect(mockFindOne().select).toHaveBeenCalledWith('+password')
    })
  })
})

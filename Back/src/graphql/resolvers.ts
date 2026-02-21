import mongoose from 'mongoose'
import { User } from '../models/User'
import { Task, TaskStatus } from '../models/Task'
import { generateToken } from '../middleware/auth'
import { generateRandomId } from '../helpers/utils'

export interface GraphQLContext {
  userId?: string
  user?: {
    id: string
    email: string
    username: string
  }
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      const user = await User.findById(context.userId)
      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
      }
    },

    tasks: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const tasks = await Task.find({ userId: userIdObjectId }).sort({
        updatedAt: -1,
      })

      return tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId.toString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }))
    },

    task: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const taskIdObjectId = new mongoose.Types.ObjectId(id)
      const task = await Task.findOne({
        _id: taskIdObjectId,
        userId: userIdObjectId,
      })
      if (!task) {
        throw new Error('Task not found')
      }

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId.toString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }
    },
  },

  Mutation: {
    registerUser: async (
      _: unknown,
      {
        name,
        email,
        username,
        password,
      }: { name: string; email: string; username?: string; password: string },
      context: GraphQLContext,
    ) => {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: (username || email.split('@')[0]).toLowerCase() },
        ],
      })

      if (existingUser) {
        throw new Error('User already exists with this email or username')
      }

      const user = new User({
        name,
        email: email.toLowerCase(),
        username: (username || email.split('@')[0]).toLowerCase(),
        password,
        auth0Id: generateRandomId(),
      })

      await user.save()

      const token = generateToken(
        user._id.toString(),
        user.email,
        user.username,
      )

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      }
    },

    loginUser: async (
      _: unknown,
      {
        emailOrUsername,
        password,
      }: { emailOrUsername: string; password: string },
      context: GraphQLContext,
    ) => {
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      }).select('+password') // Include password field

      if (!user) {
        throw new Error('Invalid email/username or password')
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw new Error('Invalid email/username or password')
      }

      const token = generateToken(
        user._id.toString(),
        user.email,
        user.username,
      )

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      }
    },

    createTask: async (
      _: unknown,
      { title, description }: { title: string; description?: string },
      context: GraphQLContext,
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      if (!title || !title.trim()) {
        throw new Error('Title is required')
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const task = new Task({
        title: title.trim(),
        description: description?.trim(),
        status: 'PENDING',
        userId: userIdObjectId,
      })

      await task.save()

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId.toString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }
    },

    updateTask: async (
      _: unknown,
      {
        id,
        title,
        description,
      }: { id: string; title?: string; description?: string },
      context: GraphQLContext,
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const taskIdObjectId = new mongoose.Types.ObjectId(id)
      const task = await Task.findOne({
        _id: taskIdObjectId,
        userId: userIdObjectId,
      })
      if (!task) {
        throw new Error('Task not found')
      }

      if (title !== undefined) {
        if (!title.trim()) {
          throw new Error('Title cannot be empty')
        }
        task.title = title.trim()
      }

      if (description !== undefined) {
        task.description = description?.trim() || undefined
      }

      await task.save()

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId.toString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }
    },

    deleteTask: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const taskIdObjectId = new mongoose.Types.ObjectId(id)
      const task = await Task.findOneAndDelete({
        _id: taskIdObjectId,
        userId: userIdObjectId,
      })
      if (!task) {
        throw new Error('Task not found')
      }

      return true
    },

    changeTaskStatus: async (
      _: unknown,
      { id, status }: { id: string; status: TaskStatus },
      context: GraphQLContext,
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required')
      }

      if (!['PENDING', 'IN_PROGRESS', 'DONE', 'ARCHIVED'].includes(status)) {
        throw new Error(
          'Valid status is required (PENDING, IN_PROGRESS, DONE, ARCHIVED)',
        )
      }

      const userIdObjectId = new mongoose.Types.ObjectId(context.userId)
      const taskIdObjectId = new mongoose.Types.ObjectId(id)
      const task = await Task.findOne({
        _id: taskIdObjectId,
        userId: userIdObjectId,
      })
      if (!task) {
        throw new Error('Task not found')
      }

      task.status = status
      await task.save()

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId.toString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }
    },
  },
}

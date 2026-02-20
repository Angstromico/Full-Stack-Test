import { Response, NextFunction } from 'express'
import { Task, TaskStatus } from '../models/Task'
import { User } from '../models/User'
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from '../helpers/httpStatusCodes'
import { AuthRequest } from './authController'

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { title, description } = req.body

    if (!title || !title.trim()) {
      res.status(BAD_REQUEST).json({ error: 'Title is required' })
      return
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      status: 'PENDING',
      userId: user._id,
    })

    await task.save()

    res.status(CREATED).json({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to create task' })
  }
}

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const tasks = await Task.find({ userId: user._id }).sort({ updatedAt: -1 })

    res.status(OK).json(
      tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    )
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to get tasks' })
  }
}

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { id } = req.params
    const { title, description } = req.body

    const task = await Task.findOne({ _id: id, userId: user._id })

    if (!task) {
      res.status(NOT_FOUND).json({ error: 'Task not found' })
      return
    }

    if (title !== undefined) {
      if (!title.trim()) {
        res.status(BAD_REQUEST).json({ error: 'Title cannot be empty' })
        return
      }
      task.title = title.trim()
    }

    if (description !== undefined) {
      task.description = description?.trim() || undefined
    }

    await task.save()

    res.status(OK).json({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to update task' })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { id } = req.params

    const task = await Task.findOneAndDelete({ _id: id, userId: user._id })

    if (!task) {
      res.status(NOT_FOUND).json({ error: 'Task not found' })
      return
    }

    res.status(OK).json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete task' })
  }
}

export const changeTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { id } = req.params
    const { status } = req.body

    if (!status || !['PENDING', 'IN_PROGRESS', 'DONE', 'ARCHIVED'].includes(status)) {
      res.status(BAD_REQUEST).json({ error: 'Valid status is required (PENDING, IN_PROGRESS, DONE, ARCHIVED)' })
      return
    }

    const task = await Task.findOne({ _id: id, userId: user._id })

    if (!task) {
      res.status(NOT_FOUND).json({ error: 'Task not found' })
      return
    }

    task.status = status as TaskStatus
    await task.save()

    res.status(OK).json({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error('Change task status error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to change task status' })
  }
}

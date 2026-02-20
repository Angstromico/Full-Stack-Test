import mongoose, { Schema, Document } from 'mongoose'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export interface ITask extends Document {
  title: string
  description?: string
  status: TaskStatus
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'ARCHIVED'],
      default: 'PENDING',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries by user
TaskSchema.index({ userId: 1, status: 1 })

export const Task = mongoose.model<ITask>('Task', TaskSchema)

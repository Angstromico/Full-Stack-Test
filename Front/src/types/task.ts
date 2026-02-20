export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
}

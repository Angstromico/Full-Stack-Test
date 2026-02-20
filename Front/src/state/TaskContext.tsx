import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'

export type TaskStatus = 'pending' | 'in-progress' | 'done'

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

type TaskContextValue = {
  tasks: Task[]
  addTask: (input: { title: string; description?: string }) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

function storageKeyForUser(username: string | null | undefined) {
  return `task-crud:tasks:${username ?? 'anonymous'}`
}

function readTasks(username: string | null | undefined): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const key = storageKeyForUser(username)
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writeTasks(username: string | null | undefined, tasks: Task[]) {
  if (typeof window === 'undefined') return
  const key = storageKeyForUser(username)
  window.localStorage.setItem(key, JSON.stringify(tasks))
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>(() => readTasks(user?.username))

  useEffect(() => {
    setTasks(readTasks(user?.username))
  }, [user?.username])

  useEffect(() => {
    writeTasks(user?.username, tasks)
  }, [tasks, user?.username])

  const addTask = useCallback(
    (input: { title: string; description?: string }) => {
      const now = new Date().toISOString()
      const next: Task = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }
      setTasks((prev) => [...prev, next])
    },
    [],
  )

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      )
    },
    [],
  )

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      addTask,
      updateTask,
      deleteTask,
    }),
    [tasks, addTask, updateTask, deleteTask],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return ctx
}


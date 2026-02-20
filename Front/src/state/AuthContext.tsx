import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type User = {
  username: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USERS_KEY = 'task-crud:users'
const SESSION_KEY = 'task-crud:session'

type StoredUser = {
  username: string
  password: string
}

function readUsersFromStorage(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) {
      return [
        {
          username: 'admin',
          password: '123',
        },
      ]
    }
    const parsed = JSON.parse(raw) as StoredUser[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [
        {
          username: 'admin',
          password: '123',
        },
      ]
    }
    return parsed
  } catch {
    return [
      {
        username: 'admin',
        password: '123',
      },
    ]
  }
}

function writeUsersToStorage(users: StoredUser[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSessionFromStorage(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as User
    return parsed ?? null
  } catch {
    return null
  }
}

function writeSessionToStorage(user: User | null) {
  if (typeof window === 'undefined') return
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY)
  } else {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSessionFromStorage())
  const [users, setUsers] = useState<StoredUser[]>(() => readUsersFromStorage())

  useEffect(() => {
    writeUsersToStorage(users)
  }, [users])

  useEffect(() => {
    writeSessionToStorage(user)
  }, [user])

  const login = useCallback(
    async (username: string, password: string) => {
      const existing = users.find((u) => u.username === username && u.password === password)
      if (!existing) {
        return false
      }
      setUser({ username: existing.username })
      return true
    },
    [users],
  )

  const register = useCallback(
    async (username: string, password: string) => {
      const existing = users.find((u) => u.username === username)
      if (existing) {
        return false
      }
      const nextUsers = [...users, { username, password }]
      setUsers(nextUsers)
      setUser({ username })
      return true
    },
    [users],
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}


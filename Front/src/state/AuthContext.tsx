import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { LOGIN_USER, REGISTER_USER } from '../api/mutations'
import { GET_ME } from '../api/queries'
import type { User } from '../types/task'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    username: string | undefined,
    password: string,
  ) => Promise<boolean>
  logout: () => void
  getToken: () => string | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

const TOKEN_KEY = 'auth_token'

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function setTokenInStorage(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [token, setToken] = useState<string | null>(() => getTokenFromStorage())

  const [loginMutation] = useMutation(LOGIN_USER)
  const [registerMutation] = useMutation(REGISTER_USER)

  // Fetch user data when token exists
  const {
    data: userData,
    loading: loadingUser,
    refetch: refetchUser,
  } = useQuery(GET_ME, {
    skip: !token,
    fetchPolicy: 'network-only',
    onError: () => {
      // If query fails, token might be invalid, clear it
      setToken(null)
      setTokenInStorage(null)
      setUser(null)
    },
  })

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me)
    } else if (!token) {
      setUser(null)
    }
  }, [userData, token])

  const login = useCallback(
    async (emailOrUsername: string, password: string): Promise<boolean> => {
      try {
        setIsLoadingUser(true)
        const result = await loginMutation({
          variables: { emailOrUsername, password },
        })

        if (result.data?.loginUser?.token && result.data?.loginUser?.user) {
          const authToken = result.data.loginUser.token
          setToken(authToken)
          setTokenInStorage(authToken)
          setUser(result.data.loginUser.user)
          // Refetch user to ensure consistency
          await refetchUser()
          return true
        }
        return false
      } catch (error: unknown) {
        console.error('Login error:', error)
        return false
      } finally {
        setIsLoadingUser(false)
      }
    },
    [loginMutation, refetchUser],
  )

  const register = useCallback(
    async (
      name: string,
      email: string,
      username: string | undefined,
      password: string,
    ): Promise<boolean> => {
      try {
        setIsLoadingUser(true)
        const result = await registerMutation({
          variables: { name, email, username, password },
        })

        if (
          result.data?.registerUser?.token &&
          result.data?.registerUser?.user
        ) {
          const authToken = result.data.registerUser.token
          setToken(authToken)
          setTokenInStorage(authToken)
          setUser(result.data.registerUser.user)
          // Refetch user to ensure consistency
          await refetchUser()
          return true
        }
        return false
      } catch (error: unknown) {
        console.error('Register error:', error)
        return false
      } finally {
        setIsLoadingUser(false)
      }
    },
    [registerMutation, refetchUser],
  )

  const logout = useCallback(() => {
    setToken(null)
    setTokenInStorage(null)
    setUser(null)
  }, [])

  const getToken = useCallback(() => {
    return token
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(token && user),
      isLoading: isLoadingUser || loadingUser,
      login,
      register,
      logout,
      getToken,
    }),
    [
      user,
      token,
      isLoadingUser,
      loadingUser,
      login,
      register,
      logout,
      getToken,
    ],
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

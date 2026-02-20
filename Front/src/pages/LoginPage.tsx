import React from 'react' // needed for React.FormEvent
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

type LocationState = {
  from?: string
}

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null)
  const { login, register, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(state?.from ?? '/tasks', { replace: true })
    }
  }, [isAuthenticated, navigate, state])

  // Reset form when switching tabs – moved to Tabs onChange to avoid useEffect setState warning
  const handleTabChange = (
    _event: React.SyntheticEvent,
    value: 'login' | 'register',
  ) => {
    setMode(value)
    // Clear all fields and errors
    setName('')
    setEmail('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setPasswordError(null)
    setConfirmPasswordError(null)
  }

  // Validate password requirements
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length === 0) return null
    return pwd.length < 6 ? 'Password must be at least 6 characters long' : null
  }

  // Validate password confirmation
  const validateConfirmPassword = (
    pwd: string,
    confirmPwd: string,
  ): string | null => {
    if (confirmPwd.length === 0) return null
    return pwd !== confirmPwd ? 'Passwords do not match' : null
  }

  // Handle password change
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    if (mode === 'register') {
      setPasswordError(validatePassword(newPassword))
      if (confirmPassword) {
        setConfirmPasswordError(
          validateConfirmPassword(newPassword, confirmPassword),
        )
      }
    }
  }

  // Handle confirm password change
  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword)
    if (mode === 'register') {
      setConfirmPasswordError(
        validateConfirmPassword(password, newConfirmPassword),
      )
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email/username and password.')
      return
    }

    try {
      const success = await login(email.trim(), password)
      if (success) {
        navigate(state?.from ?? '/tasks', { replace: true })
      } else {
        setError('Invalid email/username or password. Please try again.')
      }
    } catch (err: unknown) {
      // Properly handle unknown error type
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.',
      )
    }
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validate all fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError('All fields are required.')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    // Validate password requirements
    const pwdError = validatePassword(password)
    if (pwdError) {
      setPasswordError(pwdError)
      setError(pwdError)
      return
    }

    // Validate password match
    const confirmPwdError = validateConfirmPassword(password, confirmPassword)
    if (confirmPwdError) {
      setConfirmPasswordError(confirmPwdError)
      setError(confirmPwdError)
      return
    }

    // Clear any previous errors
    setPasswordError(null)
    setConfirmPasswordError(null)

    try {
      const success = await register(
        name.trim(),
        email.trim(),
        username.trim() || undefined,
        password,
      )
      if (success) {
        navigate(state?.from ?? '/tasks', { replace: true })
      } else {
        setError(
          'Registration failed. This email or username may already be in use.',
        )
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.',
      )
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Card
        sx={{ width: '100%', maxWidth: 420, borderRadius: 3, boxShadow: 3 }}
      >
        <Tabs
          value={mode}
          onChange={handleTabChange}
          variant='fullWidth'
          aria-label='Login or register'
        >
          <Tab label='Login' value='login' />
          <Tab label='Register' value='register' />
        </Tabs>
        <CardContent sx={{ pt: 3 }}>
          <Typography variant='h5' mb={1}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </Typography>
          <Typography variant='body2' color='text.secondary' mb={2}>
            {mode === 'login'
              ? 'Sign in with your email or username and password.'
              : 'Create a new account. All fields are required except username (will be generated from email if not provided).'}
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {mode === 'login' ? (
            <Box
              component='form'
              onSubmit={handleLogin}
              noValidate
              sx={{ display: 'grid', gap: 2.5 }}
            >
              <TextField
                label='Email or Username'
                autoComplete='username'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                required
                autoFocus
              />
              <TextField
                label='Password'
                type='password'
                autoComplete='current-password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
              />
              <Button
                type='submit'
                variant='contained'
                size='large'
                sx={{ mt: 1 }}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          ) : (
            <Box
              component='form'
              onSubmit={handleRegister}
              noValidate
              sx={{ display: 'grid', gap: 2.5 }}
            >
              <TextField
                label='Name'
                autoComplete='name'
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
                required
                autoFocus
              />
              <TextField
                label='Email'
                type='email'
                autoComplete='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label='Username (optional)'
                autoComplete='username'
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                helperText='If not provided, will be generated from your email'
              />
              <TextField
                label='Password'
                type='password'
                autoComplete='new-password'
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                fullWidth
                required
                error={!!passwordError}
                helperText={passwordError || 'Must be at least 6 characters'}
              />
              <TextField
                label='Confirm Password'
                type='password'
                autoComplete='new-password'
                value={confirmPassword}
                onChange={(event) =>
                  handleConfirmPasswordChange(event.target.value)
                }
                fullWidth
                required
                error={!!confirmPasswordError}
                helperText={confirmPasswordError || 'Re-enter your password'}
              />
              <Button
                type='submit'
                variant='contained'
                size='large'
                sx={{ mt: 1 }}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register & Login'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

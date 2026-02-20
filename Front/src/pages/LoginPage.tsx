import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

type LocationState = {
  from?: string
}

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.')
      return
    }

    if (mode === 'login') {
      const ok = await login(username.trim(), password.trim())
      if (!ok) {
        setError('Invalid credentials. Try again or register a new account.')
        return
      }
    } else {
      const ok = await register(username.trim(), password.trim())
      if (!ok) {
        setError('This username is already taken. Please choose another one.')
        return
      }
    }

    navigate(state?.from ?? '/tasks', { replace: true })
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
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Tabs
          value={mode}
          onChange={(_, value) => setMode(value)}
          variant="fullWidth"
          aria-label="Login or register"
        >
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>
        <CardContent sx={{ pt: 3 }}>
          <Typography variant="h5" mb={1}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Use the demo credentials <strong>admin / 123</strong> or register your own account.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2.5 }}>
            <TextField
              label="Username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
              {mode === 'login' ? 'Login' : 'Register & login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}


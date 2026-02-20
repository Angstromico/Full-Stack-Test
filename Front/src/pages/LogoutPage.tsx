import { Box, Button, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 2500)
    return () => window.clearTimeout(timeout)
  }, [navigate])

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        You are logged out
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Your session has ended. You can safely close this tab or log in again.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/login')}>
        Go to login
      </Button>
    </Box>
  )
}


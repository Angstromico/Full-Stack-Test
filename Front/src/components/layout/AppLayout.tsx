import { Container, Box, Paper } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function AppLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Container
        sx={{
          flex: 1,
          py: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  )
}


import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../state/AuthContext'

export function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/logout')
  }

  const navItems = [
    { to: '/tasks', label: 'Tasks' },
    { to: '/task-manager', label: 'Task Manager' },
  ]

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ gap: 2 }}>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/tasks"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          Task CRUD
        </Typography>

        <Box
          sx={{
            display: { xs: menuOpen ? 'flex' : 'none', sm: 'flex' },
            flexGrow: 1,
            gap: 1,
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', sm: 'center' },
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color={location.pathname === item.to ? 'secondary' : 'inherit'}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                px: 2,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isAuthenticated && user && (
            <Typography
              variant="body2"
              sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 160 }}
              noWrap
            >
              Signed in as <strong>{user.name || user.username}</strong>
            </Typography>
          )}
          {isAuthenticated ? (
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleLogout}
              sx={{ textTransform: 'none', borderRadius: 999 }}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{ textTransform: 'none', borderRadius: 999 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}


import { Header } from '../../src/components/layout/Header'
import { MemoryRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AuthContext } from '../../src/state/AuthContext'

describe('Header component', () => {
  const theme = createTheme()

  beforeEach(() => {
    cy.viewport(1024, 768)
  })

  it('shows Login when not authenticated', () => {
    cy.mount(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider
            value={{
              user: null,
              isAuthenticated: false,
              isLoading: false,
              login: cy.stub(),
              register: cy.stub(),
              logout: cy.stub(),
              getToken: cy.stub(),
            }}
          >
            <Header />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    cy.contains('Login').should('be.visible')
  })

  it('shows Logout and username when authenticated', () => {
    cy.mount(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider
            value={{
              user: { name: 'Memz', username: 'memz' },
              isAuthenticated: true,
              isLoading: false,
              login: cy.stub(),
              register: cy.stub(),
              logout: cy.stub(),
              getToken: cy.stub(),
            }}
          >
            <Header />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    cy.contains('Logout').should('be.visible')
    cy.contains('Signed in as').should('be.visible')
    cy.contains('Memz').should('be.visible')
  })
})

# Full-Stack Frontend - React 19 + TypeScript + Vite + Cypress

This is the frontend application for the Full-Stack Technical Test, built with **React 19**, **TypeScript**, **Vite**, **Material UI**, and comprehensive **Cypress** testing. It provides a modern, responsive user interface for task management with full authentication integration.

---

## 🏗️ Architecture Overview

The frontend follows modern React patterns with clean separation of concerns:

### Core Technologies
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Material UI (MUI)** - Component library and theming
- **React Router** - Client-side routing
- **Apollo Client** - GraphQL client
- **TanStack Query** - Data fetching and caching
- **Auth0 React SDK** - Authentication
- **Cypress** - Component and E2E testing

### Project Structure
```
Front/
├── src/
│   ├── api/            # Apollo Client config, GraphQL queries/mutations
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom hooks (useTasks, useUser)
│   ├── pages/         # Page components
│   ├── routes/        # Route protection components
│   ├── state/         # Context providers (AuthContext)
│   ├── types/         # TypeScript type definitions
│   └── main.tsx       # Application entry point
├── cypress/
│   ├── component/     # Component tests
│   ├── e2e/          # End-to-end tests
│   ├── fixtures/      # Test data and mocks
│   └── config.ts      # Cypress configuration
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

---

## 🧪 Testing with Cypress

This frontend implements comprehensive testing using **Cypress** for both component testing and end-to-end testing.

### Testing Configuration

**File**: `cypress.config.ts`
```typescript
import { defineConfig } from "cypress"

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    supportFile: 'cypress/support/component.ts',
  },
})
```

**Key Features**:
- **Component Testing**: Isolated component testing with React + Vite
- **E2E Testing**: Full application testing in real browser
- **Visual Testing**: Screenshot and video recording
- **Custom Commands**: Reusable test utilities
- **Mocking**: Network and API mocking capabilities

### Test Structure

**Directory**: `cypress/`
```
cypress/
├── component/
│   ├── Header.cy.tsx           # Header component tests
│   ├── TaskForm.cy.tsx         # Task form component tests
│   ├── TaskList.cy.tsx         # Task list component tests
│   └── Login.cy.tsx            # Login component tests
├── e2e/
│   ├── authentication.cy.ts    # Full auth flow tests
│   ├── task-management.cy.ts    # Task CRUD operations
│   ├── navigation.cy.ts         # Navigation and routing
│   └── responsive.cy.ts        # Responsive design tests
├── fixtures/
│   ├── users.json              # Test user data
│   ├── tasks.json              # Test task data
│   └── auth.json               # Auth mock data
├── support/
│   ├── commands.ts             # Custom Cypress commands
│   ├── component.ts            # Component test setup
│   └── e2e.ts                 # E2E test setup
└── config.ts                  # Cypress configuration
```

### Running Tests

```bash
# Install dependencies
npm install

# Open Cypress test runner (interactive)
npm run test

# Run component tests only
npm run test:component

# Run E2E tests only
npm run test:e2e

# Run tests in headless mode (CI/CD)
npm run test:headless

# Run tests with specific browser
npm run test:chrome
npm run test:firefox

# Generate test reports
npm run test:report
```

### Test Examples

#### Component Testing
```typescript
// cypress/component/Header.cy.tsx
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
    cy.contains('Logout').should('not.exist')
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
    cy.contains('Login').should('not.exist')
  })

  it('is responsive on mobile devices', () => {
    cy.viewport(375, 667) // iPhone SE

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

    // Test mobile layout
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
    cy.get('[data-testid="desktop-nav"]').should('not.exist')
  })
})
```

#### Task Form Component Testing
```typescript
// cypress/component/TaskForm.cy.tsx
import { TaskForm } from '../../src/components/tasks/TaskForm'
import { createTheme, ThemeProvider } from '@mui/material/styles'

describe('TaskForm component', () => {
  const theme = createTheme()
  const mockOnSubmit = cy.stub()

  beforeEach(() => {
    mockOnSubmit.resetHistory()
  })

  it('renders form with required fields', () => {
    cy.mount(
      <ThemeProvider theme={theme}>
        <TaskForm onSubmit={mockOnSubmit} />
      </ThemeProvider>,
    )

    cy.get('input[placeholder="Task Title"]').should('be.visible')
    cy.get('textarea[placeholder="Task Description"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    cy.contains('Create Task').should('be.visible')
  })

  it('validates required title field', () => {
    cy.mount(
      <ThemeProvider theme={theme}>
        <TaskForm onSubmit={mockOnSubmit} />
      </ThemeProvider>,
    )

    cy.get('button[type="submit"]').click()
    cy.contains('Title is required').should('be.visible')
    expect(mockOnSubmit).not.to.have.been.called
  })

  it('submits form with valid data', () => {
    cy.mount(
      <ThemeProvider theme={theme}>
        <TaskForm onSubmit={mockOnSubmit} />
      </ThemeProvider>,
    )

    cy.get('input[placeholder="Task Title"]').type('Test Task')
    cy.get('textarea[placeholder="Task Description"]').type('Test Description')
    cy.get('button[type="submit"]').click()

    expect(mockOnSubmit).to.have.been.calledWith({
      title: 'Test Task',
      description: 'Test Description'
    })
  })

  it('shows loading state during submission', () => {
    cy.mount(
      <ThemeProvider theme={theme}>
        <TaskForm onSubmit={mockOnSubmit} loading={true} />
      </ThemeProvider>,
    )

    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('[data-testid="loading-spinner"]').should('be.visible')
  })
})
```

#### E2E Testing
```typescript
// cypress/e2e/authentication.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage and cookies
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should allow user to login and logout', () => {
    cy.visit('/')

    // Mock Auth0 authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'mock-jwt-token')
      win.localStorage.setItem('token_expires', (Date.now() + 3600000).toString())
    })

    // Mock GraphQL responses
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetMe') {
        req.reply({
          data: {
            me: {
              id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              username: 'testuser'
            }
          }
        })
      }
    }).as('getUser')

    cy.visit('/tasks')
    cy.wait('@getUser')

    // Verify user is logged in
    cy.contains('Signed in as Test User').should('be.visible')
    cy.contains('Logout').should('be.visible')

    // Test logout
    cy.contains('Logout').click()
    cy.url().should('include', '/logout')
  })

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/tasks')
    cy.url().should('include', '/login')
  })

  it('should handle token expiration', () => {
    // Set expired token
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'expired-token')
      win.localStorage.setItem('token_expires', (Date.now() - 1000).toString())
    })

    cy.visit('/tasks')
    cy.url().should('include', '/login')
  })
})
```

#### Task Management E2E Testing
```typescript
// cypress/e2e/task-management.cy.ts
describe('Task Management', () => {
  beforeEach(() => {
    // Setup authenticated state
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'mock-jwt-token')
      win.localStorage.setItem('token_expires', (Date.now() + 3600000).toString())
    })

    // Mock GraphQL responses
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetMe') {
        req.reply({
          data: {
            me: {
              id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              username: 'testuser'
            }
          }
        })
      }
      if (req.body.operationName === 'GetTasks') {
        req.reply({
          data: {
            tasks: [
              {
                id: 'task1',
                title: 'Existing Task',
                description: 'Existing Description',
                status: 'PENDING',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              }
            ]
          }
        })
      }
      if (req.body.operationName === 'CreateTask') {
        req.reply({
          data: {
            createTask: {
              id: 'task2',
              title: req.body.variables.title,
              description: req.body.variables.description,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        })
      }
    }).as('graphql')
  })

  it('should create a new task', () => {
    cy.visit('/task-manager')

    // Wait for initial data
    cy.wait('@graphql')

    // Fill out task form
    cy.get('input[placeholder="Task Title"]').type('New Test Task')
    cy.get('textarea[placeholder="Task Description"]').type('New Test Description')
    cy.get('button[type="submit"]').click()

    // Verify task was created
    cy.wait('@graphql')
    cy.contains('New Test Task').should('be.visible')
    cy.contains('New Test Description').should('be.visible')
  })

  it('should change task status', () => {
    cy.visit('/task-manager')
    cy.wait('@graphql')

    // Find existing task and change status
    cy.contains('Existing Task').parent().find('[data-testid="status-menu"]').click()
    cy.contains('IN_PROGRESS').click()

    // Verify status change
    cy.contains('IN_PROGRESS').should('be.visible')
  })

  it('should delete a task', () => {
    cy.visit('/task-manager')
    cy.wait('@graphql')

    // Mock delete mutation
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'DeleteTask') {
        req.reply({
          data: {
            deleteTask: {
              id: 'task1',
              success: true
            }
          }
        })
      }
    }).as('deleteTask')

    // Delete task
    cy.contains('Existing Task').parent().find('[data-testid="delete-button"]').click()
    cy.contains('Delete').click()

    // Verify task was deleted
    cy.wait('@deleteTask')
    cy.contains('Existing Task').should('not.exist')
  })
})
```

### Custom Cypress Commands

**File**: `cypress/support/commands.ts`
```typescript
// Custom command for authentication
Cypress.Commands.add('login', (userData = {}) => {
  const defaultUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser'
  }

  const user = { ...defaultUser, ...userData }

  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'mock-jwt-token')
    win.localStorage.setItem('token_expires', (Date.now() + 3600000).toString())
    win.localStorage.setItem('user', JSON.stringify(user))
  })

  // Mock GraphQL responses
  cy.intercept('POST', '/graphql', (req) => {
    if (req.body.operationName === 'GetMe') {
      req.reply({ data: { me: user } })
    }
  })
})

// Custom command for mocking GraphQL
Cypress.Commands.add('mockGraphQL', (mocks) => {
  cy.intercept('POST', '/graphql', (req) => {
    const mock = mocks[req.body.operationName]
    if (mock) {
      req.reply(mock)
    }
  })
})

// Custom command for responsive testing
Cypress.Commands.add('testResponsive', (callback) => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1024, height: 768 }
  ]

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
    callback()
  })
})
```

### Testing Best Practices

#### 1. **Component Testing**
- Test components in isolation
- Mock external dependencies
- Test all user interactions
- Verify accessibility
- Test responsive behavior

#### 2. **E2E Testing**
- Test complete user journeys
- Use realistic test data
- Test error scenarios
- Verify cross-browser compatibility
- Test performance and loading states

#### 3. **Mocking Strategy**
- Mock external APIs and services
- Use consistent mock data
- Test both success and failure scenarios
- Reset mocks between tests

#### 4. **Test Organization**
- Group related tests in describe blocks
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Keep tests independent

#### 5. **Visual Testing**
- Test responsive design
- Verify component states
- Test loading and error states
- Use accessibility testing

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or other package manager
- **Backend API** running on port 8080
- **Auth0** application configured

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Front

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Environment Variables
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=task-manager-crud-api
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

---

## 📚 Component Library

### Core Components

#### Header Component
- Navigation and user authentication
- Responsive design with mobile menu
- User profile display
- Logout functionality

#### TaskForm Component
- Task creation and editing
- Form validation
- Loading states
- Error handling

#### TaskList Component
- Task display and management
- Status filtering
- Responsive grid layout
- Interactive actions

#### ProtectedRoute Component
- Authentication guard
- Redirect handling
- Loading states

### Custom Hooks

#### useTasks Hook
```typescript
const {
  tasks,
  isLoading,
  error,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus
} = useTasks()
```

#### useUser Hook
```typescript
const {
  user,
  isLoading,
  error,
  refetch
} = useUser()
```

---

## 🎨 UI/UX Features

### Material UI Integration
- **Theme System**: Customizable color schemes
- **Responsive Design**: Mobile-first approach
- **Component Library**: Consistent design patterns
- **Dark Mode**: Theme switching capability

### User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback
- **Accessibility**: WCAG compliance

---

## 🔧 Development Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "cypress open",
    "test:component": "cypress open --component",
    "test:e2e": "cypress open --e2e",
    "test:headless": "cypress run",
    "test:chrome": "cypress run --browser chrome",
    "test:firefox": "cypress run --browser firefox",
    "test:report": "cypress run --reporter mochawesome"
  }
}
```

---

## 🛡️ Security Features

- **Auth0 Integration**: Secure authentication
- **Token Management**: Automatic token refresh
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Secure API communication
- **Environment Variables**: Sensitive data protection

---

## 📊 Performance Optimization

- **Code Splitting**: Lazy loading with React Router
- **Bundle Optimization**: Vite build optimizations
- **Image Optimization**: Responsive images
- **Caching**: Apollo Client and TanStack Query caching
- **Tree Shaking**: Unused code elimination

---

## 📝 Next Steps

- Add visual regression testing
- Implement performance testing
- Add accessibility testing suite
- Set up CI/CD pipeline with automated testing
- Add internationalization (i18n)
- Implement offline functionality
- Add PWA features

## Technical Test – Full Stack JavaScript (React + Vite, Express + TypeScript, GraphQL)

This repository contains a full‑stack implementation of the **Technical Test – Full Stack Javascript Programmer** using:

- **Front end**: React 19, Vite, TypeScript, **Material UI**, React Router, **Apollo Client**, **TanStack Query**, **Auth0**
- **Back end**: Express with TypeScript, **GraphQL** (Apollo Server), **MongoDB**, **Auth0 JWT Bearer**
- **API design**: GraphQL as the communication layer between front end and back end

---

## Project structure

- `Front/`: React + Vite + TypeScript single‑page application
  - Uses **Material UI** for UI/UX
  - Uses **React Router** for navigation between pages
  - Uses **Apollo Client** for GraphQL communication
  - Uses **TanStack Query** for data caching and state management
  - Uses **Auth0** for authentication
- `Back/`: Express + TypeScript back end with GraphQL API
  - **GraphQL resolvers** handling all business logic
  - **MongoDB** for data persistence
  - **Auth0 JWT Bearer** middleware for authentication
  - **GraphQL** API with Apollo Server

---

## Back end (Express + TypeScript + GraphQL + MongoDB + Auth0)

### Tech stack

- **Express** with **TypeScript**
- **Apollo Server Express** for GraphQL API
- **MongoDB** with **Mongoose** ODM
- **Auth0** JWT Bearer authentication using `express-oauth2-jwt-bearer`
- **GraphQL** for API layer

### Architecture overview

The back end follows **GraphQL-first architecture** with clean separation of concerns:

#### Folder structure

```
Back/
├── src/
│   ├── config/          # Configuration files (database, environment)
│   ├── graphql/         # GraphQL schema, resolvers, and context
│   ├── helpers/         # Helper utilities (HTTP status codes)
│   ├── middleware/     # Express middleware (Auth0 JWT)
│   ├── models/         # MongoDB models (User, Task)
│   └── index.ts        # Application entry point
```

#### Key components

- **`src/helpers/httpStatusCodes.ts`**
  - Centralized HTTP status code constants (e.g., `BAD_REQUEST = 400`, `NOT_FOUND = 404`)
  - Used throughout controllers for consistent error responses

- **`src/config/database.ts`**
  - MongoDB connection using Mongoose
  - Exports `connectDatabase()` function

- **`src/config/env.ts`**
  - Environment variable configuration
  - Type-safe access to `PORT`, `MONGODB`, and Auth0 credentials

- **`src/models/User.ts`**
  - User model with `name`, `email`, `username`, `password`
  - Both `email` and `username` are unique and indexed
  - Password hashing with bcryptjs
  - Timestamps for `createdAt` and `updatedAt`

- **`src/models/Task.ts`**
  - Task model with `title`, `description`, `status`, `userId`
  - Status enum: `PENDING` → `IN_PROGRESS` → `DONE` → `ARCHIVED`
  - Indexed by `userId` and `status` for efficient queries

- **`src/middleware/auth.ts`**
  - JWT token generation and validation utilities
  - Password hashing and comparison functions

- **`src/graphql/resolvers.ts`**
  - GraphQL resolvers implementing the schema
  - **Authentication resolvers**: `registerUser`, `loginUser`
  - **Task resolvers**: `createTask`, `getTasks`, `updateTask`, `deleteTask`, `changeTaskStatus`
  - **Query resolvers**: `me`, `tasks`, `task(id)`
  - All resolvers check authentication via context
  - Tasks are filtered by `userId` to ensure user isolation

- **`src/graphql/schema.ts`**
  - GraphQL type definitions for `User`, `Task`, and `AuthPayload`
  - Queries: `me`, `tasks`, `task(id)`
  - Mutations: `registerUser`, `loginUser`, `createTask`, `updateTask`, `deleteTask`, `changeTaskStatus`

- **`src/graphql/context.ts`**
  - Creates GraphQL context from JWT payload
  - Extracts `userId` and provides user information to resolvers

---

## Front end (React + Vite + TypeScript + Material UI + Apollo + TanStack Query)

### Tech stack

- **React 19** with **TypeScript**
- **Vite** as the build and dev server
- **Material UI (MUI)** for component library and theming
- **React Router** for client‑side routing
- **Apollo Client** for GraphQL communication
- **TanStack Query** for data caching and optimistic updates
- **Auth0 React SDK** (`@auth0/auth0-react`) for authentication

### Architecture overview

The front‑end app is structured around **pages**, **reusable components**, **hooks**, and **API layer**:

#### Folder structure

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
```

#### Key components

- **`src/api/apolloClient.ts`**
  - Apollo Client configuration
  - Auth link that adds Auth0 JWT token to requests
  - Token expiration checking and automatic cleanup

- **`src/api/queries.ts`**
  - GraphQL queries: `GET_ME`, `GET_TASKS`, `GET_TASK`

- **`src/api/mutations.ts`**
  - GraphQL mutations: `REGISTER_USER`, `LOGIN_USER`, `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `CHANGE_TASK_STATUS`

- **`src/state/AuthContext.tsx`**
  - Auth context using Auth0 React SDK
  - Manages Auth0 token storage and expiration checking
  - Integrates with GraphQL mutations for user registration/login
  - Fetches user data via GraphQL `GET_ME` query

- **`src/hooks/useTasks.ts`**
  - Custom hook using TanStack Query + Apollo Client
  - Provides `tasks`, `isLoading`, `createTask`, `updateTask`, `deleteTask`, `changeTaskStatus`
  - Automatic cache invalidation on mutations

- **`src/hooks/useUser.ts`**
  - Custom hook for fetching current user data
  - Uses TanStack Query with Apollo Client

- **`src/components/layout/Header.tsx`**
  - Responsive app header with navigation
  - Shows current user name and logout button

- **`src/components/tasks/TaskForm.tsx`**
  - Form for creating/editing tasks
  - Title (required) and description (optional)

- **`src/components/tasks/TaskList.tsx`**
  - Displays list of tasks with status chips
  - Supports edit, delete, and status toggle actions
  - Status values: PENDING, IN_PROGRESS, DONE, ARCHIVED

- **`src/routes/ProtectedRoute.tsx`**
  - Route wrapper that redirects unauthenticated users to login
  - Preserves original path for post-login redirect

### Pages and navigation

- `/login` – **Login / Register page**
  - **Login**: Redirects to Auth0 for authentication
  - **Register**: After Auth0 authentication, creates user account with name, email, and optional username
  - Both email and username must be unique in the database

- `/tasks` – **Tasks page**
  - Protected route (requires Auth0 authentication)
  - Read-oriented view of user's tasks
  - Status progression: PENDING → IN_PROGRESS → DONE

- `/task-manager` – **Task Manager page**
  - Protected route (requires Auth0 authentication)
  - Split layout: form on left, task list on right
  - Full CRUD operations: create, edit, delete, change status
  - Status progression: PENDING → IN_PROGRESS → DONE → ARCHIVED

- `/logout` – **Logout page**
  - Confirmation screen after logout
  - Redirects to login after short delay

### GraphQL API

The GraphQL endpoint is available at `/graphql` and requires authentication via JWT Bearer token.

**Authentication mutations:**

```graphql
mutation RegisterUser($name: String!, $email: String!, $username: String, $password: String!) {
  registerUser(name: $name, email: $email, username: $username, password: $password) {
    token
    user {
      id
      name
      email
      username
    }
  }
}

mutation LoginUser($emailOrUsername: String!, $password: String!) {
  loginUser(emailOrUsername: $emailOrUsername, password: $password) {
    token
    user {
      id
      name
      email
      username
    }
  }
}
```

**Example queries:**

```graphql
query GetMe {
  me {
    id
    name
    email
    username
  }
}

query GetTasks {
  tasks {
    id
    title
    description
    status
    createdAt
    updatedAt
  }
}
```

**Task mutations:**

```graphql
mutation CreateTask($title: String!, $description: String) {
  createTask(title: $title, description: $description) {
    id
    title
    description
    status
  }
}
```

---

## Environment variables

### Back end (`Back/.env`)

```env
PORT=8080
MONGODB=mongodb+srv://...
JWT_SECRET=your-jwt-secret-key
```

### Front end (`Front/.env`)

```env
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

---

## How to run the project

### Prerequisites

- Node.js 20+
- npm (or another Node package manager)
- MongoDB database (local or Atlas)

### Install dependencies

From the repository root:

```bash
cd Back
npm install

cd ../Front
npm install
```

### Run the back end

```bash
cd Back
npm run dev
```

The GraphQL endpoint will be available at `http://localhost:8080/graphql`

### Run the front end

```bash
cd Front
npm run dev
```

Then open the URL that Vite prints in the terminal (typically `http://localhost:5173`).

---

## Authentication flow

1. User registers with email, username, and password via `registerUser` mutation
2. User logs in with email/username and password via `loginUser` mutation
3. Back end validates credentials and returns JWT token
4. Token stored in frontend and sent with subsequent GraphQL requests
5. User data fetched via `me` query and stored in context
6. Token expiration checked periodically; user logged out if expired

---

## How to test

1. **Start both servers** (backend and frontend)
2. **Open the front end** in your browser
3. **Register a new account**:
   - Fill in name, email, username, and password
   - Click "Register"
4. **Login with your credentials**:
   - Use email or username with password
   - Click "Login"
5. **Explore the app**:
   - View tasks on the Tasks page
   - Create, edit, delete tasks on the Task Manager page
   - Change task statuses (PENDING → IN_PROGRESS → DONE → ARCHIVED)
6. **All data is stored in MongoDB** and associated with your user account

## Testing Strategy

This project implements a comprehensive testing approach covering unit tests, integration tests, and end-to-end tests:

### Backend Testing (Jest + TypeScript)

**Framework**: Jest with TypeScript support via `ts-jest`

**Configuration**: `Back/jest.config.js`
- TypeScript compilation with isolated modules
- Node.js test environment
- Module path resolution for `src/` directory

**Test Structure**: `Back/src/tests/`
- Unit tests for GraphQL resolvers, models, and utilities
- Mock implementations for external dependencies (MongoDB, JWT)
- Authentication resolver testing for `registerUser` and `loginUser`
- Task resolver testing for CRUD operations

**Example Test Structure**:
```typescript
// GraphQL resolver test example
describe('GraphQL Auth Resolvers', () => {
  describe('registerUser mutation', () => {
    it('should register user successfully', async () => {
      // Test implementation with mocked User model
    })
  })

  describe('loginUser mutation', () => {
    it('should login user successfully', async () => {
      // Test implementation with mocked User model and password comparison
    })
  })
})
```

**Running Tests**:
```bash
cd Back
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

**GraphQL Resolver Tests**:
- **Authentication Tests**: `registerUser` and `loginUser` mutations
  - User registration with email/username validation
  - Password hashing and storage
  - User login with email/username and password validation
  - Token generation on successful authentication
  - Error handling for duplicate users and invalid credentials

**Coverage Reports**: Tests generate detailed coverage reports showing:
- Function coverage
- Statement coverage  
- Branch coverage
- Line coverage

### Frontend Testing (Cypress)

**Framework**: Cypress for component and E2E testing

**Configuration**: `Front/cypress.config.ts`
- Component testing with React + Vite
- E2E testing setup
- Custom event handlers and plugins

**Test Structure**: 
- `Front/cypress/component/` - Component tests
- `Front/cypress/e2e/` - End-to-end tests
- `Front/cypress/fixtures/` - Test data and mocks

**Running Tests**:
```bash
cd Front
npm run test            # Open Cypress test runner
npm run test:component  # Run component tests
npm run test:e2e        # Run E2E tests
```

**Component Testing Example**:
```typescript
// Header component test
describe('Header component', () => {
  it('shows Login when not authenticated', () => {
    cy.mount(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <Header />
      </AuthContext.Provider>
    )
    cy.contains('Login').should('be.visible')
  })
})
```

**E2E Testing Features**:
- Full user journey testing
- Authentication flow testing
- CRUD operation testing
- Cross-browser compatibility
- Visual regression testing

### Testing Best Practices

**Backend Testing**:
- **Mock External Dependencies**: MongoDB, JWT token generation
- **Test GraphQL Resolvers**: Authentication mutations, task CRUD operations
- **Error Scenarios**: Test failure cases and edge conditions
- **Database Operations**: Test model validations and queries
- **Authentication**: Test JWT token generation and user isolation

**Frontend Testing**:
- **Component Isolation**: Test components in isolation with mocked dependencies
- **User Interactions**: Test clicks, forms, navigation
- **State Management**: Test context providers and state changes
- **API Integration**: Test GraphQL queries and mutations
- **Responsive Design**: Test different viewport sizes

**Continuous Integration**:
- Automated test runs on pull requests
- Coverage thresholds enforcement
- Test result reporting
- Performance regression testing

---

## Features

- ✅ **JWT authentication** with secure password hashing
- ✅ **MongoDB** for persistent data storage
- ✅ **GraphQL API** with Apollo Server
- ✅ **Apollo Client** in frontend for GraphQL communication
- ✅ **TanStack Query** for data caching and optimistic updates
- ✅ **GraphQL-first architecture** with resolvers handling business logic
- ✅ **DRY principles** with centralized HTTP status codes
- ✅ **TypeScript** throughout for type safety
- ✅ **Material UI** for responsive, modern UI
- ✅ **Task status workflow**: PENDING → IN_PROGRESS → DONE → ARCHIVED
- ✅ **User isolation**: Each user only sees their own tasks
- ✅ **Token expiration handling**: Automatic logout when token expires
- ✅ **Unique constraints**: Email and username must be unique
- ✅ **Comprehensive testing**: Jest tests for GraphQL resolvers

---

## Next steps / possible extensions

- Add input validation and error handling improvements
- Add filters/search and sorting for the tasks list
- Add pagination for tasks
- Add tests (unit tests, integration tests, E2E tests)
- Add real-time updates with GraphQL subscriptions
- Add task due dates and priorities
- Add task categories/tags

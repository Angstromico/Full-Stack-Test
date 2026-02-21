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
  - **MVC architecture** with controllers, models, and GraphQL resolvers
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

The back end follows **MVC architecture** with clean separation of concerns:

#### Folder structure

```
Back/
├── src/
│   ├── config/          # Configuration files (database, environment)
│   ├── controllers/     # Business logic controllers
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
  - User model with `name`, `email`, `username`, `auth0Id`
  - Both `email` and `username` are unique and indexed
  - Timestamps for `createdAt` and `updatedAt`

- **`src/models/Task.ts`**
  - Task model with `title`, `description`, `status`, `userId`
  - Status enum: `PENDING` → `IN_PROGRESS` → `DONE` → `ARCHIVED`
  - Indexed by `userId` and `status` for efficient queries

- **`src/middleware/auth0.ts`**
  - Auth0 JWT Bearer middleware using `express-oauth2-jwt-bearer`
  - Validates JWT tokens and attaches payload to `req.auth`

- **`src/controllers/authController.ts`**
  - `registerUser`: Creates new user after Auth0 authentication
  - `loginUser`: Finds user by Auth0 ID after authentication
  - `getCurrentUser`: Returns current authenticated user

- **`src/controllers/taskController.ts`**
  - `createTask`: Creates a new task for the authenticated user
  - `getTasks`: Retrieves all tasks for the authenticated user
  - `updateTask`: Updates task title/description
  - `deleteTask`: Deletes a task
  - `changeTaskStatus`: Changes task status (PENDING → IN_PROGRESS → DONE → ARCHIVED)

- **`src/graphql/schema.ts`**
  - GraphQL type definitions for `User` and `Task`
  - Queries: `me`, `tasks`, `task(id)`
  - Mutations: `registerUser`, `loginUser`, `createTask`, `updateTask`, `deleteTask`, `changeTaskStatus`

- **`src/graphql/resolvers.ts`**
  - GraphQL resolvers implementing the schema
  - All resolvers check authentication via context
  - Tasks are filtered by `userId` to ensure user isolation

- **`src/graphql/context.ts`**
  - Creates GraphQL context from Auth0 JWT payload
  - Extracts `auth0Id` and finds corresponding MongoDB `userId`
  - Provides `auth0Id` and `userId` to all resolvers

### GraphQL API

The GraphQL endpoint is available at `/graphql` and requires authentication via Auth0 JWT Bearer token.

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

**Example mutations:**

```graphql
mutation RegisterUser($name: String!, $email: String!, $username: String) {
  registerUser(name: $name, email: $email, username: $username) {
    id
    name
    email
    username
  }
}

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

### Authentication flow

1. User clicks "Login" → Redirected to Auth0
2. User authenticates with Auth0 (email/password or social login)
3. Auth0 redirects back with authorization code
4. Front end exchanges code for access token
5. Token stored in localStorage with expiration time
6. Front end calls `loginUser` GraphQL mutation
7. Back end finds user by Auth0 ID or creates new user via `registerUser`
8. User data fetched via `GET_ME` query and stored in context
9. Token expiration checked periodically; user logged out if expired

---

## Environment variables

### Back end (`Back/.env`)

```env
PORT=8080
MONGODB=mongodb+srv://...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_DOMAIN=dev-....us.auth0.com
AUTH0_AUDIENCE=task-manager-crud-api
```

### Front end (`Front/.env`)

```env
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
VITE_AUTH0_DOMAIN=dev-....us.auth0.com
VITE_AUTH0_CLIENT_ID=...
VITE_AUTH0_AUDIENCE=task-manager-crud-api
```

---

## How to run the project

### Prerequisites

- Node.js 20+
- npm (or another Node package manager)
- MongoDB database (local or Atlas)
- Auth0 account and application configured

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

## How to test

1. **Start both servers** (backend and frontend)
2. **Open the front end** in your browser
3. **Click Login** → You'll be redirected to Auth0
4. **Authenticate with Auth0** (create account if needed)
5. **After authentication**, you'll be redirected back
6. **If it's your first time**, register your account:
   - Fill in name, email, and optional username
   - Click "Register & Login"
7. **Explore the app**:
   - View tasks on the Tasks page
   - Create, edit, delete tasks on the Task Manager page
   - Change task statuses (PENDING → IN_PROGRESS → DONE → ARCHIVED)
8. **All data is stored in MongoDB** and associated with your Auth0 user account

## Testing Strategy

This project implements a comprehensive testing approach covering unit tests, integration tests, and end-to-end tests:

### Backend Testing (Jest + TypeScript)

**Framework**: Jest with TypeScript support via `ts-jest`

**Configuration**: `Back/jest.config.js`
- TypeScript compilation with isolated modules
- Node.js test environment
- Module path resolution for `src/` directory

**Test Structure**: `Back/src/tests/`
- Unit tests for controllers, models, and utilities
- Mock implementations for external dependencies (MongoDB, Auth0)
- HTTP status code testing for API endpoints

**Running Tests**:
```bash
cd Back
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

**Example Test Structure**:
```typescript
// Controller test example
describe('Unit Test: registerUser Controller', () => {
  let mockReq: Partial<Request> | any
  let mockRes: Partial<Response> | any
  let next: any = jest.fn()

  beforeEach(() => {
    // Setup mocks
  })

  it('should register user successfully', async () => {
    // Test implementation
  })
})
```

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
- **Mock External Dependencies**: MongoDB, Auth0, external APIs
- **Test HTTP Responses**: Status codes, headers, response bodies
- **Error Scenarios**: Test failure cases and edge conditions
- **Database Operations**: Test model validations and queries
- **Authentication**: Test JWT token validation and user isolation

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

- ✅ **Auth0 authentication** with JWT Bearer tokens
- ✅ **MongoDB** for persistent data storage
- ✅ **GraphQL API** with Apollo Server
- ✅ **Apollo Client** in frontend for GraphQL communication
- ✅ **TanStack Query** for data caching and optimistic updates
- ✅ **MVC architecture** in backend with clean separation
- ✅ **DRY principles** with centralized HTTP status codes
- ✅ **TypeScript** throughout for type safety
- ✅ **Material UI** for responsive, modern UI
- ✅ **Task status workflow**: PENDING → IN_PROGRESS → DONE → ARCHIVED
- ✅ **User isolation**: Each user only sees their own tasks
- ✅ **Token expiration handling**: Automatic logout when token expires
- ✅ **Unique constraints**: Email and username must be unique

---

## Next steps / possible extensions

- Add input validation and error handling improvements
- Add filters/search and sorting for the tasks list
- Add pagination for tasks
- Add tests (unit tests, integration tests, E2E tests)
- Add real-time updates with GraphQL subscriptions
- Add task due dates and priorities
- Add task categories/tags

# Full-Stack Backend - Node.js + TypeScript + GraphQL + Auth0

This is the backend API for the Full-Stack Technical Test, built with **Express**, **TypeScript**, **GraphQL**, **MongoDB**, and **Auth0** authentication. It provides a secure, scalable API layer for task management with comprehensive testing coverage.

---

## 🏗️ Architecture Overview

The backend follows **MVC architecture** with clean separation of concerns:

### Core Technologies
- **Express.js** - Web framework with TypeScript
- **Apollo Server** - GraphQL API server
- **MongoDB** - NoSQL database with Mongoose ODM
- **Auth0** - Authentication and authorization
- **Jest** - Testing framework with TypeScript support

### Project Structure
```
Back/
├── src/
│   ├── config/          # Configuration (database, environment, Auth0)
│   ├── controllers/     # Business logic controllers
│   ├── graphql/         # GraphQL schema, resolvers, context
│   ├── helpers/         # Utility functions (HTTP status codes)
│   ├── middleware/      # Express middleware (Auth0 JWT)
│   ├── models/         # MongoDB models (User, Task)
│   ├── tests/          # Jest unit and integration tests
│   └── index.ts        # Application entry point
├── jest.config.js      # Jest configuration
└── package.json        # Dependencies and scripts
```

---

## 🧪 Testing with Jest

This backend implements comprehensive testing using **Jest** with full TypeScript support.

### Testing Configuration

**File**: `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
}
```

**Key Features**:
- **TypeScript Support**: Full compilation with `ts-jest`
- **Isolated Modules**: Prevents module cross-contamination
- **Node Environment**: Optimized for backend testing
- **Path Resolution**: Direct imports from `src/` directory

### Test Structure

**Directory**: `src/tests/`
```
src/tests/
├── authController.test.ts    # Authentication controller tests
├── taskController.test.ts     # Task management tests
├── graphql/
│   ├── resolvers.test.ts      # GraphQL resolver tests
│   └── schema.test.ts         # Schema validation tests
├── models/
│   ├── User.test.ts           # User model tests
│   └── Task.test.ts           # Task model tests
└── helpers/
    └── httpStatusCodes.test.ts # Utility function tests
```

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests matching a pattern
npm test -- authController

# Run tests with coverage for specific files
npm run test:coverage -- --collectCoverageFrom="src/controllers/*"
```

### Test Examples

#### Controller Testing
```typescript
// src/tests/authController.test.ts
import { registerUser } from '../controllers/authController'
import { User } from '../models/User'
import { CREATED, BAD_REQUEST } from '../helpers/httpStatusCodes'

jest.mock('../models/User')

describe('Unit Test: registerUser Controller', () => {
  let mockReq: Partial<Request> | any
  let mockRes: Partial<Response> | any
  let next: any = jest.fn()

  beforeEach(() => {
    mockReq = {
      auth: { payload: { sub: 'auth0|123', nickname: 'manueldev' } },
      body: { name: 'Manuel Morales', email: 'test@gmail.com' },
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  it('should register user successfully', async () => {
    // Mock database responses
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    
    const savedUser = {
      _id: 'mock-id',
      name: 'Manuel Morales',
      email: 'test@gmail.com',
      username: 'manueldev',
      save: jest.fn().mockResolvedValue(true),
    }
    
    ;(User as unknown as jest.Mock).mockImplementation(() => savedUser)

    await registerUser(mockReq, mockRes, next)

    expect(mockRes.status).toHaveBeenCalledWith(CREATED)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@gmail.com' })
    )
  })

  it('should fail if user already exists', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue({ email: 'test@gmail.com' })

    await registerUser(mockReq, mockRes, next)

    expect(mockRes.status).toHaveBeenCalledWith(BAD_REQUEST)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'User already exists with this email, username, or Auth0 ID',
    })
  })
})
```

#### GraphQL Resolver Testing
```typescript
// src/tests/graphql/resolvers.test.ts
import { resolvers } from '../graphql/resolvers'
import { User } from '../models/User'

jest.mock('../models/User')

describe('GraphQL Resolvers', () => {
  const mockContext = {
    userId: 'user123',
    user: { id: 'user123', email: 'test@example.com', username: 'testuser' }
  }

  describe('Query: me', () => {
    it('should return current user', async () => {
      const result = await resolvers.Query.me(null, null, mockContext)
      
      expect(result).toEqual(mockContext.user)
    })
  })

  describe('Mutation: createTask', () => {
    it('should create a new task', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' }
      
      // Mock Task model creation
      const mockTask = {
        _id: 'task123',
        ...taskData,
        status: 'PENDING',
        userId: 'user123',
        save: jest.fn().mockResolvedValue(true)
      }

      const result = await resolvers.Mutation.createTask(
        null, 
        taskData, 
        mockContext
      )

      expect(result.title).toBe(taskData.title)
      expect(result.userId).toBe(mockContext.userId)
    })
  })
})
```

#### Model Testing
```typescript
// src/tests/models/User.test.ts
import { User } from '../models/User'
import { connectDatabase } from '../config/database'

describe('User Model', () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterAll(async () => {
    await User.deleteMany({})
  })

  it('should create a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      auth0Id: 'auth0|123'
    }

    const user = new User(userData)
    const savedUser = await user.save()

    expect(savedUser.name).toBe(userData.name)
    expect(savedUser.email).toBe(userData.email)
    expect(savedUser.username).toBe(userData.username)
    expect(savedUser.auth0Id).toBe(userData.auth0Id)
  })

  it('should enforce unique email constraint', async () => {
    const userData = {
      name: 'Test User 2',
      email: 'test@example.com', // Same email
      username: 'testuser2',
      auth0Id: 'auth0|456'
    }

    const user = new User(userData)
    
    await expect(user.save()).rejects.toThrow()
  })
})
```

### Mocking Strategies

#### Database Mocking
```typescript
// Mock Mongoose models
jest.mock('../models/User')
jest.mock('../models/Task')

// Mock database connection
jest.mock('../config/database', () => ({
  connectDatabase: jest.fn().mockResolvedValue(true)
}))
```

#### Auth0 Mocking
```typescript
// Mock Auth0 middleware
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => (req, res, next) => {
    req.auth = {
      payload: { sub: 'auth0|123', email: 'test@example.com' }
    }
    next()
  })
}))
```

#### External API Mocking
```typescript
// Mock fetch for external API calls
global.fetch = jest.fn()
;(fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ access_token: 'mock-token' })
})
```

### Coverage Reports

Generate comprehensive coverage reports:

```bash
npm run test:coverage
```

**Coverage Report Includes**:
- **Statement Coverage**: Every line of code executed
- **Branch Coverage**: All conditional branches tested
- **Function Coverage**: All functions called
- **Line Coverage**: Every executable line covered

**Coverage Thresholds** (configured in `jest.config.js`):
```javascript
collectCoverage: true,
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Testing Best Practices

#### 1. **Test Structure**
- **Arrange**: Setup test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected behavior

#### 2. **Mock Management**
- Mock external dependencies (database, APIs)
- Use consistent mock data across tests
- Clean up mocks after each test

#### 3. **Error Testing**
- Test success scenarios
- Test error conditions and edge cases
- Verify proper error handling and status codes

#### 4. **Isolation**
- Each test should be independent
- Use `beforeEach`/`afterEach` for cleanup
- Avoid test dependencies

#### 5. **Assertions**
- Use specific assertions
- Test both positive and negative cases
- Verify side effects (database changes, API calls)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **Auth0** account and application

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Back

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Environment Variables
```env
PORT=8080
MONGODB=mongodb://localhost:27017/task-manager
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173

# Auth0 Configuration
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=task-manager-crud-api
```

### Running the Application

```bash
# Development mode with auto-restart
npm run dev

# Production build
npm run build

# Start production server
npm start

# Health check
curl http://localhost:8080/health
```

---

## 📚 API Documentation

### GraphQL Endpoint
- **URL**: `http://localhost:8080/graphql`
- **Authentication**: Bearer token required
- **Playground**: Available in development mode

### Key Queries
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

### Key Mutations
```graphql
mutation CreateTask($title: String!, $description: String) {
  createTask(title: $title, description: $description) {
    id
    title
    description
    status
  }
}

mutation ChangeTaskStatus($id: ID!, $status: TaskStatus!) {
  changeTaskStatus(id: $id, status: $status) {
    id
    status
  }
}
```

---

## 🔧 Development Scripts

```json
{
  "scripts": {
    "start": "nodemon --exec ts-node src/index.ts",
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🛡️ Security Features

- **Auth0 JWT Bearer** authentication
- **User isolation** (users only see their own data)
- **Input validation** and sanitization
- **CORS** configuration
- **Environment variable** protection
- **MongoDB** injection protection via Mongoose

---

## 📝 Next Steps

- Add integration tests for GraphQL API
- Implement API rate limiting
- Add request/response logging
- Set up CI/CD pipeline with automated testing
- Add performance monitoring
- Implement database migrations

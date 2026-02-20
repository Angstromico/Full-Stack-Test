import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { connectDatabase } from './config/database'
import { config } from './config/env'
import { typeDefs } from './graphql/schema'
import { resolvers } from './graphql/resolvers'
import { createContext } from './graphql/context'

const app = express()

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
)

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  introspection: true, // Enable in development
})

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase()

    // Start Apollo Server
    await apolloServer.start()

    // Apply Apollo Server middleware
    apolloServer.applyMiddleware({ app, path: '/graphql', cors: false })

    const server = http.createServer(app)

    server.listen(config.port, () => {
      console.log(`🚀 Server listening on http://localhost:${config.port}/`)
      console.log(`📊 GraphQL endpoint: http://localhost:${config.port}${apolloServer.graphqlPath}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

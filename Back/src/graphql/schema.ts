import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    userId: ID!
    createdAt: String!
    updatedAt: String!
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    DONE
    ARCHIVED
  }

  type Query {
    me: User
    tasks: [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    registerUser(name: String!, email: String!, username: String, password: String!): AuthPayload!
    loginUser(emailOrUsername: String!, password: String!): AuthPayload!
    createTask(title: String!, description: String): Task!
    updateTask(id: ID!, title: String, description: String): Task!
    deleteTask(id: ID!): Boolean!
    changeTaskStatus(id: ID!, status: TaskStatus!): Task!
  }
`

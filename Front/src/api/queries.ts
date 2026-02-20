import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      username
    }
  }
`

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      status
      userId
      createdAt
      updatedAt
    }
  }
`

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      userId
      createdAt
      updatedAt
    }
  }
`

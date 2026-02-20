import { gql } from '@apollo/client'

export const REGISTER_USER = gql`
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
`

export const LOGIN_USER = gql`
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
`

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String) {
    createTask(title: $title, description: $description) {
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

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String) {
    updateTask(id: $id, title: $title, description: $description) {
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

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`

export const CHANGE_TASK_STATUS = gql`
  mutation ChangeTaskStatus($id: ID!, $status: TaskStatus!) {
    changeTaskStatus(id: $id, status: $status) {
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

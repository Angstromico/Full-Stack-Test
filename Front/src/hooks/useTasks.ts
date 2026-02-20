import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'
import { GET_TASKS } from '../api/queries'
import { CREATE_TASK, UPDATE_TASK, DELETE_TASK, CHANGE_TASK_STATUS } from '../api/mutations'
import type { Task, TaskStatus } from '../types/task'

export function useTasks() {
  const apolloClient = useApolloClient()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await apolloClient.query({
        query: GET_TASKS,
        fetchPolicy: 'network-only',
      })
      return result.data.tasks as Task[]
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const result = await apolloClient.mutate({
        mutation: CREATE_TASK,
        variables: { title, description },
      })
      return result.data.createTask as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title?: string; description?: string }) => {
      const result = await apolloClient.mutate({
        mutation: UPDATE_TASK,
        variables: { id, title, description },
      })
      return result.data.updateTask as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await apolloClient.mutate({
        mutation: DELETE_TASK,
        variables: { id },
      })
      return result.data.deleteTask as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const changeTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const result = await apolloClient.mutate({
        mutation: CHANGE_TASK_STATUS,
        variables: { id, status },
      })
      return result.data.changeTaskStatus as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return {
    tasks: data || [],
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    changeTaskStatus: changeTaskStatusMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isChangingStatus: changeTaskStatusMutation.isPending,
  }
}

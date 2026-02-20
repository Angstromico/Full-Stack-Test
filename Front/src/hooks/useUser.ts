import { useQuery } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'
import { GET_ME } from '../api/queries'
import type { User } from '../types/task'

export function useUser() {
  const apolloClient = useApolloClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const result = await apolloClient.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      })
      return result.data.me as User
    },
    enabled: Boolean(localStorage.getItem('auth_token')),
  })

  return {
    user: data || null,
    isLoading,
    error,
  }
}

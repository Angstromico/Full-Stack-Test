import { Box, CircularProgress, Divider, Typography } from '@mui/material'
import { useTasks } from '../hooks/useTasks'
import { TaskList } from '../components/tasks/TaskList'

export function TasksPage() {
  const { tasks, isLoading, changeTaskStatus } = useTasks()

  const handleToggleStatus = (task: { id: string; status: string }) => {
    if (task.status === 'DONE') {
      changeTaskStatus({ id: task.id, status: 'PENDING' })
    } else if (task.status === 'PENDING') {
      changeTaskStatus({ id: task.id, status: 'IN_PROGRESS' })
    } else if (task.status === 'IN_PROGRESS') {
      changeTaskStatus({ id: task.id, status: 'DONE' })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Your tasks
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This view is focused on quickly browsing your tasks. Use the Task Manager page to create
          and edit items.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: { sm: 1 } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TaskList tasks={tasks} onToggleStatus={handleToggleStatus} />
        )}
      </Box>
    </Box>
  )
}

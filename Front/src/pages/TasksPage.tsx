import { Box, Divider, Typography } from '@mui/material'
import { useTasks } from '../state/TaskContext'
import { TaskList } from '../components/tasks/TaskList'

export function TasksPage() {
  const { tasks, updateTask } = useTasks()

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
        <TaskList
          tasks={tasks}
          onToggleDone={(task) =>
            updateTask(task.id, {
              status: task.status === 'done' ? 'pending' : 'done',
            })
          }
        />
      </Box>
    </Box>
  )
}


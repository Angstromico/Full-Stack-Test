import {
  Box,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskList } from '../components/tasks/TaskList'
import type { Task } from '../types/task'

export function TaskManagerPage() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
  } = useTasks()
  const [editing, setEditing] = useState<Task | undefined>(undefined)
  const [isFormReadOnly, setIsFormReadOnly] = useState(false)

  const handleCreate = (input: { title: string; description?: string }) => {
    createTask(input)
  }

  const handleEdit = (input: { title: string; description?: string }) => {
    if (!editing) return
    updateTask({
      id: editing.id,
      title: input.title,
      description: input.description,
    })
    setEditing(undefined)
  }

  const handleToggleStatus = (task: Task) => {
    if (task.status !== 'IN_PROGRESS') {
      setIsFormReadOnly(false)
    } else {
      setIsFormReadOnly(true)
    }

    if (task.status === 'PENDING') {
      changeTaskStatus({ id: task.id, status: 'IN_PROGRESS' })
    } else if (task.status === 'IN_PROGRESS') {
      changeTaskStatus({ id: task.id, status: 'DONE' })
    } else if (task.status === 'DONE') {
      changeTaskStatus({ id: task.id, status: 'ARCHIVED' })
    } else if (task.status === 'ARCHIVED') {
      changeTaskStatus({ id: task.id, status: 'PENDING' })
    }
  }

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}
    >
      <Box>
        <Typography variant='h4' gutterBottom>
          Task manager
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Create, update, and delete tasks. All changes are saved to MongoDB and
          associated with your account.
        </Typography>
      </Box>
      <Divider />
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant='h6'>
              {editing ? 'Edit task' : 'Create a new task'}
            </Typography>
            <TaskForm
              key={editing ? `edit-${editing.id}` : 'create-new'}
              initialTask={editing}
              onSubmit={editing ? handleEdit : handleCreate}
              onCancel={() => setEditing(undefined)}
              isReadOnly={isFormReadOnly}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Typography variant='h6' sx={{ mb: 1 }}>
              All tasks
            </Typography>
            <Box
              sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: { sm: 1 } }}
            >
              <TaskList
                tasks={tasks}
                onEdit={setEditing}
                onDelete={(task) => deleteTask(task.id)}
                onToggleStatus={handleToggleStatus}
                emptyMessage='No tasks yet. Use the form on the left to add one.'
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

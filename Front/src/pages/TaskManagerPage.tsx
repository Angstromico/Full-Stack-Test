import { Box, Divider, Grid2 as Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { useTasks, type Task } from '../state/TaskContext'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskList } from '../components/tasks/TaskList'

export function TaskManagerPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [editing, setEditing] = useState<Task | undefined>(undefined)

  const handleCreate = (input: { title: string; description?: string }) => {
    addTask(input)
  }

  const handleEdit = (input: { title: string; description?: string }) => {
    if (!editing) return
    updateTask(editing.id, { title: input.title, description: input.description })
    setEditing(undefined)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Task manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create, update, and delete tasks. Changes are stored per-user in your browser&apos;s local
          storage.
        </Typography>
      </Box>
      <Divider />
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">
            {editing ? 'Edit task' : 'Create a new task'}
          </Typography>
          <TaskForm
            initialTask={editing}
            onSubmit={editing ? handleEdit : handleCreate}
            onCancel={() => setEditing(undefined)}
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
          <Typography variant="h6" sx={{ mb: 1 }}>
            All tasks
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: { sm: 1 } }}>
            <TaskList
              tasks={tasks}
              onEdit={setEditing}
              onDelete={(task) => deleteTask(task.id)}
              onToggleDone={(task) =>
                updateTask(task.id, {
                  status: task.status === 'done' ? 'pending' : 'done',
                })
              }
              emptyMessage="No tasks yet. Use the form on the left to add one."
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}


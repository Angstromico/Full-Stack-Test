import { Stack, TextField, Button } from '@mui/material'
import { useState } from 'react'
import type { Task } from '../../types/task'

type Props = {
  initialTask?: Task
  onSubmit: (data: { title: string; description?: string }) => void
  onCancel?: () => void
}

export function TaskForm({ initialTask, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    })
    if (!initialTask) {
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label='Title'
          fullWidth
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          label='Description'
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          {onCancel && (
            <Button variant='text' onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type='submit' variant='contained'>
            {initialTask ? 'Save changes' : 'Add task'}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

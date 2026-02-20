import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import type { Task } from '../../state/TaskContext'

type Props = {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleDone?: (task: Task) => void
  emptyMessage?: string
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggleDone,
  emptyMessage = 'No tasks yet. Create your first one!',
}: Props) {
  if (tasks.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <List sx={{ width: '100%' }}>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: 'background.paper',
            boxShadow: 0.5,
          }}
        >
          <ListItemText
            primary={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </Typography>
                <Chip
                  size="small"
                  label={
                    task.status === 'pending'
                      ? 'Pending'
                      : task.status === 'in-progress'
                        ? 'In progress'
                        : 'Done'
                  }
                  color={
                    task.status === 'pending'
                      ? 'default'
                      : task.status === 'in-progress'
                        ? 'secondary'
                        : 'success'
                  }
                />
              </Box>
            }
            secondary={
              <>
                {task.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line', mt: 0.5 }}
                  >
                    {task.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                  Updated{' '}
                  {new Date(task.updatedAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </Typography>
              </>
            }
          />
          <ListItemSecondaryAction>
            {onToggleDone && (
              <Tooltip title={task.status === 'done' ? 'Mark as pending' : 'Mark as done'}>
                <IconButton
                  edge="end"
                  onClick={() => onToggleDone(task)}
                  sx={{ mr: 0.5 }}
                  color={task.status === 'done' ? 'default' : 'success'}
                >
                  {task.status === 'done' ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton edge="end" onClick={() => onEdit(task)} sx={{ mr: 0.5 }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton edge="end" onClick={() => onDelete(task)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}


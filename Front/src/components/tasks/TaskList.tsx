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
import type { Task } from '../../types/task'

type Props = {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleStatus?: (task: Task) => void
  emptyMessage?: string
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'DONE':
      return 'Done'
    case 'ARCHIVED':
      return 'Archived'
    default:
      return status
  }
}

const getStatusColor = (status: string): 'default' | 'secondary' | 'success' | 'warning' => {
  switch (status) {
    case 'PENDING':
      return 'default'
    case 'IN_PROGRESS':
      return 'secondary'
    case 'DONE':
      return 'success'
    case 'ARCHIVED':
      return 'warning'
    default:
      return 'default'
  }
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
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
                    textDecoration: task.status === 'DONE' || task.status === 'ARCHIVED' ? 'line-through' : 'none',
                    opacity: task.status === 'ARCHIVED' ? 0.6 : 1,
                  }}
                >
                  {task.title}
                </Typography>
                <Chip size="small" label={getStatusLabel(task.status)} color={getStatusColor(task.status)} />
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
            {onToggleStatus && (
              <Tooltip title={`Change status from ${getStatusLabel(task.status)}`}>
                <IconButton
                  edge="end"
                  onClick={() => onToggleStatus(task)}
                  sx={{ mr: 0.5 }}
                  color={task.status === 'DONE' ? 'success' : 'default'}
                >
                  {task.status === 'DONE' ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
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

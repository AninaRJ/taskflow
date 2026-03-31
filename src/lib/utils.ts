import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isPast, isToday, isTomorrow, differenceInMinutes } from 'date-fns'
import type { Priority, Task } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get start of day (midnight) in user's timezone as UTC Date
 */
export function getTodayUTC(): Date {
  const now = new Date()
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone

  const dateString = now.toLocaleString('en-US', {
    timeZone: userTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const [month, day, year] = dateString.split('/')
  const todayUTC = new Date(`${year}-${month}-${day}T00:00:00Z`)
  return todayUTC
}

/**
 * Check if a date string is in the past (using user's timezone)
 */
export function isPastInUserTz(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

/**
 * Check if a date string is today (using user's timezone)
 */
export function IsTodayInUserTz(dateString: string): boolean {
  const date = new Date(dateString)
  const today = getTodayUTC()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return date >= today && date < tomorrow
}

// ─── Priority helpers ─────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string; borderColor: string; order: number }
> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    order: 0,
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    order: 1,
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    order: 2,
  },
  low: {
    label: 'Low',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    order: 3,
  },
}

// ─── Due date helpers ─────────────────────────────────────────────────────────

export function getDueDateStatus(dueDate: string | null): {
  label: string
  color: string
  isOverdue: boolean
  isDueToday: boolean
  isDueSoon: boolean
} {
  if (!dueDate) return { label: 'No due date', color: 'text-muted-foreground', isOverdue: false, isDueToday: false, isDueSoon: false }

  const date = new Date(dueDate)
  const now = new Date()
  const minutesUntilDue = differenceInMinutes(date, now)

  if (isPast(date) && !isToday(date)) {
    return {
      label: `Overdue · ${format(date, 'MMM d')}`,
      color: 'text-red-400',
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
    }
  }
  if (isToday(date)) {
    return {
      label: minutesUntilDue < 0 ? 'Due today (past time)' : `Today · ${format(date, 'h:mm a')}`,
      color: minutesUntilDue < 0 ? 'text-red-400' : 'text-yellow-400',
      isOverdue: minutesUntilDue < 0,
      isDueToday: true,
      isDueSoon: minutesUntilDue < 60,
    }
  }
  if (isTomorrow(date)) {
    return {
      label: `Tomorrow · ${format(date, 'h:mm a')}`,
      color: 'text-orange-400',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
    }
  }
  return {
    label: format(date, 'MMM d, yyyy'),
    color: 'text-muted-foreground',
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
  }
}

export function getTasksDueForNotification(tasks: Task[], reminderMinutes: number): Task[] {
  const now = new Date()
  return tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    const dueDate = new Date(task.due_date)
    const minutesUntilDue = differenceInMinutes(dueDate, now)
    // Tasks due within the reminder window (and not yet past)
    return minutesUntilDue >= 0 && minutesUntilDue <= reminderMinutes
  })
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date()
  return tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    return isPast(new Date(task.due_date))
  })
}

// ─── Color palette for lists/categories ──────────────────────────────────────

export const COLOR_PALETTE = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

export const LIST_ICONS = [
  'CheckSquare',
  'LayoutList',
  'Briefcase',
  'Code',
  'BookOpen',
  'Home',
  'ShoppingCart',
  'Heart',
  'Star',
  'Zap',
  'Globe',
  'Music',
  'Camera',
  'Coffee',
  'Rocket',
  'Target',
]

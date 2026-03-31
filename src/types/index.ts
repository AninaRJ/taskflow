// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Category {
  id: string
  name: string
  color: string // hex color
  list_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null // ISO string
  priority: Priority
  status: TaskStatus
  category_id: string | null
  list_id: string
  position: number // for drag & drop ordering
  created_at: string
  updated_at: string
  // joined
  category?: Category | null
}

export interface TaskList {
  id: string
  name: string
  description: string | null
  color: string // accent color for this list
  icon: string // lucide icon name
  created_at: string
  // joined
  tasks?: Task[]
  categories?: Category[]
  task_count?: number
}

// ─── Form / UI Types ──────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string
  description?: string
  due_date?: string
  priority: Priority
  status: TaskStatus
  category_id?: string
  list_id: string
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string
  position?: number
}

export interface CreateListPayload {
  name: string
  description?: string
  color: string
  icon: string
}

export interface CreateCategoryPayload {
  name: string
  color: string
  list_id: string
}

// ─── Filter / Sort ────────────────────────────────────────────────────────────

export type SortField = 'due_date' | 'priority' | 'created_at' | 'title' | 'position'
export type SortDirection = 'asc' | 'desc'

export interface TaskFilters {
  search: string
  priorities: Priority[]
  statuses: TaskStatus[]
  category_ids: string[]
  due_date_range: { from: Date | null; to: Date | null }
  show_overdue: boolean
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  enabled: boolean
  remind_before_minutes: number // e.g. 30, 60, 1440 (1 day)
  notify_on_overdue: boolean
}

// ─── Supabase DB Schema ───────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      task_lists: {
        Row: TaskList
        Insert: Omit<TaskList, 'id' | 'created_at'>
        Update: Partial<Omit<TaskList, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
    }
  }
}

import { supabase } from '@/lib/supabase'
import type {
  Task,
  TaskList,
  Category,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateListPayload,
  CreateCategoryPayload,
} from '@/types'

// ─── Task Lists ───────────────────────────────────────────────────────────────

export async function fetchLists(): Promise<TaskList[]> {
  const { data, error } = await supabase
    .from('task_lists')
    .select('*, tasks(count), categories(*)')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as unknown as TaskList[]) ?? []
}

export async function createList(payload: CreateListPayload): Promise<TaskList> {
  const { data, error } = await ((supabase as any)
    .from('task_lists')
    .insert(payload)
    .select()
    .single())

  if (error) throw error
  return data as unknown as TaskList
}

export async function updateList(
  id: string,
  payload: Partial<CreateListPayload>
): Promise<TaskList> {
  const { data, error } = await ((supabase as any)
    .from('task_lists')
    .update(payload)
    .eq('id', id)
    .select()
    .single())

  if (error) throw error
  return data as unknown as TaskList
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from('task_lists').delete().eq('id', id)
  if (error) throw error
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function fetchTasks(listId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('list_id', listId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as Task[]) ?? []
}

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data as unknown as Task[]) ?? []
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  // Get max position in the list
  const { data: existing } = await ((supabase as any)
    .from('tasks')
    .select('position')
    .eq('list_id', payload.list_id)
    .order('position', { ascending: false })
    .limit(1)
    .single())

  const position = existing ? (existing.position as number) + 1 : 0

  const { data, error } = await ((supabase as any)
    .from('tasks')
    .insert({ ...payload, position })
    .select('*, category:categories(*)')
    .single())

  if (error) throw error
  return data as unknown as Task
}

export async function updateTask(payload: UpdateTaskPayload): Promise<Task> {
  const { id, ...rest } = payload
  const { data, error } = await ((supabase as any)
    .from('tasks')
    .update(rest)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single())

  if (error) throw error
  return data as unknown as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function reorderTasks(
  updates: { id: string; position: number }[]
): Promise<void> {
  // Batch update positions
  await Promise.all(
    updates.map(({ id, position }) =>
      (supabase as any).from('tasks').update({ position }).eq('id', id)
    )
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories(listId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as unknown as Category[]) ?? []
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const { data, error } = await ((supabase as any)
    .from('categories')
    .insert(payload)
    .select()
    .single())

  if (error) throw error
  return data as unknown as Category
}

export async function updateCategory(
  id: string,
  payload: Partial<CreateCategoryPayload>
): Promise<Category> {
  const { data, error } = await ((supabase as any)
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single())

  if (error) throw error
  return data as unknown as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

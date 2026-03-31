'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Task,
  TaskList,
  Category,
  TaskFilters,
  SortField,
  SortDirection,
  NotificationPreferences,
} from '@/types'

interface AppState {
  // ─── Lists ────────────────────────────────────────────────────
  lists: TaskList[]
  activeListId: string | null
  setLists: (lists: TaskList[]) => void
  addList: (list: TaskList) => void
  updateList: (list: TaskList) => void
  removeList: (id: string) => void
  setActiveListId: (id: string | null) => void

  // ─── Tasks ───────────────────────────────────────────────────
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (id: string) => void
  reorderTasksLocally: (tasks: Task[]) => void

  // ─── Categories ──────────────────────────────────────────────
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  removeCategory: (id: string) => void

  // ─── Filters & Sort ──────────────────────────────────────────
  filters: TaskFilters
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
  sortField: SortField
  sortDirection: SortDirection
  setSort: (field: SortField, direction: SortDirection) => void

  // ─── UI State ────────────────────────────────────────────────
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  view: 'list' | 'calendar'
  setView: (view: 'list' | 'calendar') => void
  taskDialogOpen: boolean
  setTaskDialogOpen: (open: boolean) => void
  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void

  // ─── Notifications ────────────────────────────────────────────
  notificationPrefs: NotificationPreferences
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void
}

const defaultFilters: TaskFilters = {
  search: '',
  priorities: [],
  statuses: [],
  category_ids: [],
  due_date_range: { from: null, to: null },
  show_overdue: false,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ─── Lists ──────────────────────────────────────────────
      lists: [],
      activeListId: null,
      setLists: (lists) => set({ lists }),
      addList: (list) => set((s) => ({ lists: [...s.lists, list] })),
      updateList: (list) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === list.id ? list : l)) })),
      removeList: (id) =>
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== id),
          activeListId: s.activeListId === id ? (s.lists[0]?.id ?? null) : s.activeListId,
        })),
      setActiveListId: (id) => set({ activeListId: id }),

      // ─── Tasks ─────────────────────────────────────────────
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
      updateTask: (task) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      reorderTasksLocally: (tasks) => set({ tasks }),

      // ─── Categories ────────────────────────────────────────
      categories: [],
      setCategories: (categories) => set({ categories }),
      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),
      updateCategory: (category) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === category.id ? category : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // ─── Filters & Sort ────────────────────────────────────
      filters: defaultFilters,
      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),
      sortField: 'position',
      sortDirection: 'asc',
      setSort: (sortField, sortDirection) => set({ sortField, sortDirection }),

      // ─── UI ─────────────────────────────────────────────────
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      view: 'list',
      setView: (view) => set({ view }),
      taskDialogOpen: false,
      setTaskDialogOpen: (open) => set({ taskDialogOpen: open }),
      editingTaskId: null,
      setEditingTaskId: (id) => set({ editingTaskId: id }),

      // ─── Notifications ──────────────────────────────────────
      notificationPrefs: {
        enabled: false,
        remind_before_minutes: 60,
        notify_on_overdue: true,
      },
      setNotificationPrefs: (prefs) =>
        set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...prefs } })),
    }),
    {
      name: 'taskflow-store',
      partialize: (state) => ({
        activeListId: state.activeListId,
        sidebarOpen: state.sidebarOpen,
        view: state.view,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        notificationPrefs: state.notificationPrefs,
      }),
    }
  )
)

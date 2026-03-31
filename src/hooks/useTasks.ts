'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import * as db from '@/lib/db'
import type { CreateTaskPayload, UpdateTaskPayload, Task } from '@/types'

export function useTasks() {
  const {
    tasks,
    activeListId,
    setTasks,
    addTask,
    updateTask: updateTaskInStore,
    removeTask,
    reorderTasksLocally,
    filters,
    sortField,
    sortDirection,
  } = useStore()

  const loadTasks = useCallback(async () => {
    if (!activeListId) return
    try {
      const data = await db.fetchTasks(activeListId)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    }
  }, [activeListId, setTasks])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const create = useCallback(
    async (payload: Omit<CreateTaskPayload, 'list_id'>) => {
      if (!activeListId) return
      const task = await db.createTask({ ...payload, list_id: activeListId })
      addTask(task)
      return task
    },
    [activeListId, addTask]
  )

  const update = useCallback(
    async (payload: UpdateTaskPayload) => {
      const task = await db.updateTask(payload)
      updateTaskInStore(task)
      return task
    },
    [updateTaskInStore]
  )

  const remove = useCallback(
    async (id: string) => {
      await db.deleteTask(id)
      removeTask(id)
    },
    [removeTask]
  )

  const reorder = useCallback(
    async (reorderedTasks: Task[]) => {
      reorderTasksLocally(reorderedTasks)
      const updates = reorderedTasks.map((t, i) => ({ id: t.id, position: i }))
      await db.reorderTasks(updates)
    },
    [reorderTasksLocally]
  )

  // ─── Filtering & sorting ──────────────────────────────────────────────────

  const filteredAndSorted = useCallback(() => {
    let result = [...tasks]

    // Filter by search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }

    // Filter by priority
    if (filters.priorities.length > 0) {
      result = result.filter((t) => filters.priorities.includes(t.priority))
    }

    // Filter by status
    if (filters.statuses.length > 0) {
      result = result.filter((t) => filters.statuses.includes(t.status))
    }

    // Filter by category
    if (filters.category_ids.length > 0) {
      result = result.filter(
        (t) => t.category_id && filters.category_ids.includes(t.category_id)
      )
    }

    // Filter overdue
    if (filters.show_overdue) {
      const now = new Date()
      result = result.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
      )
    }

    // Date range
    if (filters.due_date_range.from) {
      result = result.filter(
        (t) => t.due_date && new Date(t.due_date) >= filters.due_date_range.from!
      )
    }
    if (filters.due_date_range.to) {
      result = result.filter(
        (t) => t.due_date && new Date(t.due_date) <= filters.due_date_range.to!
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'position':
          cmp = a.position - b.position
          break
        case 'due_date':
          if (!a.due_date && !b.due_date) cmp = 0
          else if (!a.due_date) cmp = 1
          else if (!b.due_date) cmp = -1
          else cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          break
        case 'priority': {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 }
          cmp = order[a.priority] - order[b.priority]
          break
        }
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortDirection === 'desc' ? -cmp : cmp
    })

    return result
  }, [tasks, filters, sortField, sortDirection])

  return {
    tasks,
    filteredTasks: filteredAndSorted(),
    create,
    update,
    remove,
    reorder,
    reload: loadTasks,
  }
}

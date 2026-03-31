'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import * as db from '@/lib/db'
import type { CreateCategoryPayload } from '@/types'

export function useCategories() {
  const {
    categories,
    activeListId,
    setCategories,
    addCategory,
    updateCategory: updateInStore,
    removeCategory,
  } = useStore()

  const loadCategories = useCallback(async () => {
    if (!activeListId) return
    try {
      const data = await db.fetchCategories(activeListId)
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [activeListId, setCategories])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const create = useCallback(
    async (payload: Omit<CreateCategoryPayload, 'list_id'>) => {
      if (!activeListId) return
      const category = await db.createCategory({ ...payload, list_id: activeListId })
      addCategory(category)
      return category
    },
    [activeListId, addCategory]
  )

  const update = useCallback(
    async (id: string, payload: Partial<CreateCategoryPayload>) => {
      const category = await db.updateCategory(id, payload)
      updateInStore(category)
      return category
    },
    [updateInStore]
  )

  const remove = useCallback(
    async (id: string) => {
      await db.deleteCategory(id)
      removeCategory(id)
    },
    [removeCategory]
  )

  return { categories, create, update, remove, reload: loadCategories }
}

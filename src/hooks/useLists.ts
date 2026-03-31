'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import * as db from '@/lib/db'
import type { CreateListPayload } from '@/types'

export function useLists() {
  const {
    lists,
    activeListId,
    setLists,
    addList,
    updateList: updateInStore,
    removeList,
    setActiveListId,
  } = useStore()

  const loadLists = useCallback(async () => {
    try {
      const data = await db.fetchLists()
      setLists(data)
      // Auto-select first list if none selected
      if (!activeListId && data.length > 0) {
        setActiveListId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load lists:', err)
    }
  }, [setLists, activeListId, setActiveListId])

  useEffect(() => {
    loadLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = useCallback(
    async (payload: CreateListPayload) => {
      const list = await db.createList(payload)
      addList(list)
      setActiveListId(list.id)
      return list
    },
    [addList, setActiveListId]
  )

  const update = useCallback(
    async (id: string, payload: Partial<CreateListPayload>) => {
      const list = await db.updateList(id, payload)
      updateInStore(list)
      return list
    },
    [updateInStore]
  )

  const remove = useCallback(
    async (id: string) => {
      await db.deleteList(id)
      removeList(id)
    },
    [removeList]
  )

  return { lists, activeListId, setActiveListId, create, update, remove }
}

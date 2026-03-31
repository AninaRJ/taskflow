'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { getTasksDueForNotification, getOverdueTasks } from '@/lib/utils'
import type { Task } from '@/types'

export function useNotifications() {
  const { notificationPrefs, tasks, setNotificationPrefs } = useStore()
  const notifiedTaskIds = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed:', err))
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission()
    if (granted) {
      setNotificationPrefs({ enabled: true })
      return true
    }
    return false
  }, [requestPermission, setNotificationPrefs])

  const showNotification = useCallback((title: string, body: string, tag?: string) => {
    if (Notification.permission !== 'granted') return
    if (typeof window === 'undefined') return

    try {
      // Try using service worker if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          tag: tag || 'taskflow',
          icon: '/icons/icon-192.png',
        })
      } else {
        // Fallback to basic Notification API
        new Notification(title, { body, icon: '/icons/icon-192.png', tag })
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
      // Double fallback
      try {
        new Notification(title, { body, tag })
      } catch {
        console.error('Notification API not available')
      }
    }
  }, [])

  const checkTasks = useCallback(
    (allTasks: Task[]) => {
      if (!notificationPrefs.enabled || Notification.permission !== 'granted') return

      // Due soon notifications
      const dueSoon = getTasksDueForNotification(
        allTasks,
        notificationPrefs.remind_before_minutes
      )
      dueSoon.forEach((task) => {
        const key = `due-${task.id}`
        if (!notifiedTaskIds.current.has(key)) {
          notifiedTaskIds.current.add(key)
          showNotification(
            `⏰ Task Due Soon`,
            `"${task.title}" is due in ${notificationPrefs.remind_before_minutes} minutes`,
            key
          )
        }
      })

      // Overdue notifications
      if (notificationPrefs.notify_on_overdue) {
        const overdue = getOverdueTasks(allTasks)
        overdue.forEach((task) => {
          const key = `overdue-${task.id}`
          if (!notifiedTaskIds.current.has(key)) {
            notifiedTaskIds.current.add(key)
            showNotification(
              `🔴 Task Overdue`,
              `"${task.title}" is past its due date`,
              key
            )
          }
        })
      }
    },
    [notificationPrefs, showNotification]
  )

  // Poll every minute
  useEffect(() => {
    if (!notificationPrefs.enabled) return

    checkTasks(tasks)
    intervalRef.current = setInterval(() => checkTasks(tasks), 60_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tasks, notificationPrefs.enabled, checkTasks])

  return {
    enableNotifications,
    permissionStatus:
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'denied',
    notificationPrefs,
    setNotificationPrefs,
  }
}

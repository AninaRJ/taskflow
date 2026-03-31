'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from '@/components/lists/Sidebar'
import { Header } from '@/components/Header'
import { TaskListView } from '@/components/tasks/TaskListView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { useStore } from '@/store'
import { useNotifications } from '@/hooks/useNotifications'
import { useLists } from '@/hooks/useLists'

export default function HomePage() {
  const { view, activeListId } = useStore()
  const { lists } = useLists()

  // Start notification polling
  useNotifications()

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {activeListId ? (
          <>
            <Header />
            <main className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {view === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="h-full"
                  >
                    <TaskListView />
                  </motion.div>
                ) : (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full"
                  >
                    <CalendarView />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <svg className="w-9 h-9 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Welcome to TaskFlow</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first task list from the sidebar to start organizing your work.
            </p>
          </div>
        )}
      </div>

      {/* Global task form dialog */}
      <TaskFormDialog />
    </div>
  )
}

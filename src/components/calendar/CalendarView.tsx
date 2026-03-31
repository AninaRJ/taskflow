'use client'

import React, { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Circle, AlertCircle } from 'lucide-react'
import { cn, PRIORITY_CONFIG, getDueDateStatus } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { useTasks } from '@/hooks/useTasks'
import type { Task } from '@/types'
import { motion } from 'motion/react'

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { tasks } = useTasks()
  const { setTaskDialogOpen, setEditingTaskId } = useStore()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Map tasks by day
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((task) => {
      if (!task.due_date) return
      const key = format(new Date(task.due_date), 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    })
    return map
  }, [tasks])

  const selectedTasks = selectedDate
    ? tasksByDay.get(format(selectedDate, 'yyyy-MM-dd')) ?? []
    : []

  const openTask = (task: Task) => {
    setEditingTaskId(task.id)
    setTaskDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 overflow-auto p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDay.get(key) ?? []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const todayDay = isToday(day)
              const overdueCount = dayTasks.filter(
                (t) => t.status !== 'done' && new Date(t.due_date!) < new Date() && !isToday(day)
              ).length

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                  className={cn(
                    'relative min-h-[80px] p-1.5 rounded-lg border text-left transition-all',
                    isCurrentMonth
                      ? 'border-border/40 bg-card/40 hover:bg-card hover:border-border'
                      : 'border-transparent bg-transparent opacity-40',
                    isSelected && 'border-primary bg-primary/5',
                    todayDay && !isSelected && 'border-primary/30 bg-primary/5'
                  )}
                >
                  {/* Day number */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1',
                      todayDay
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  {/* Task pills */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => {
                      const cfg = PRIORITY_CONFIG[task.priority]
                      const isDone = task.status === 'done'
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => { e.stopPropagation(); openTask(task) }}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate leading-tight font-medium border transition-opacity',
                            isDone
                              ? 'opacity-50 bg-muted/30 border-border/30 text-muted-foreground line-through'
                              : `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`,
                          )}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Overdue indicator */}
                  {overdueCount > 0 && (
                    <div className="absolute top-1 right-1">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Side panel: selected day tasks */}
        {selectedDate && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border overflow-hidden shrink-0"
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">{format(selectedDate, 'EEEE')}</p>
                  <p className="font-semibold">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {selectedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No tasks due on this day
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map((task) => {
                    const cfg = PRIORITY_CONFIG[task.priority]
                    const isDone = task.status === 'done'
                    const dueDateStatus = getDueDateStatus(task.due_date)
                    return (
                      <button
                        key={task.id}
                        onClick={() => openTask(task)}
                        className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Circle
                            className={cn(
                              'h-3.5 w-3.5 mt-0.5 shrink-0',
                              isDone ? 'text-primary' : 'text-muted-foreground/40'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-xs font-medium leading-snug',
                              isDone && 'line-through text-muted-foreground'
                            )}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn('text-[10px] font-medium', cfg.color)}>
                                {cfg.label}
                              </span>
                              {task.due_date && (
                                <span className={cn('text-[10px]', dueDateStatus.color)}>
                                  {format(new Date(task.due_date), 'h:mm a')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

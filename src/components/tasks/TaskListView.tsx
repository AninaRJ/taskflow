'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'motion/react'
import {
  Plus, Search, SlidersHorizontal, X, ArrowUpDown,
  CheckCircle2, AlertTriangle, ListFilter,
} from 'lucide-react'
import { cn, PRIORITY_CONFIG } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Badge } from '@/components/ui/forms'
import { TaskCard, TaskCardDragOverlay } from './TaskCard'
import { useTasks } from '@/hooks/useTasks'
import { useCategories } from '@/hooks/useCategories'
import { useStore } from '@/store'
import type { Task, Priority, TaskStatus } from '@/types'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/menus'

export function TaskListView() {
  const { setTaskDialogOpen, setEditingTaskId, filters, setFilters, resetFilters, sortField, sortDirection, setSort } = useStore()
  const { filteredTasks, reorder, tasks } = useTasks()
  const { categories } = useCategories()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = filteredTasks.findIndex((t) => t.id === active.id)
    const newIndex = filteredTasks.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...filteredTasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    reorder(reordered)
  }

  const openNewTask = () => {
    setEditingTaskId(null)
    setTaskDialogOpen(true)
  }

  // Stat counts
  const overdueCnt = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length
  const doneCnt = tasks.filter((t) => t.status === 'done').length
  const hasActiveFilters =
    filters.search ||
    filters.priorities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.category_ids.length > 0 ||
    filters.show_overdue

  const togglePriority = (p: Priority) =>
    setFilters({
      priorities: filters.priorities.includes(p)
        ? filters.priorities.filter((x) => x !== p)
        : [...filters.priorities, p],
    })

  const toggleStatus = (s: TaskStatus) =>
    setFilters({
      statuses: filters.statuses.includes(s)
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    })

  const toggleCategory = (id: string) =>
    setFilters({
      category_ids: filters.category_ids.includes(id)
        ? filters.category_ids.filter((x) => x !== id)
        : [...filters.category_ids, id],
    })

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border/50 text-xs text-muted-foreground">
        <span>{tasks.length} total</span>
        <span>·</span>
        <span className="text-green-400 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> {doneCnt} done
        </span>
        {overdueCnt > 0 && (
          <>
            <span>·</span>
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {overdueCnt} overdue
            </span>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className={cn('h-8 gap-1.5', hasActiveFilters && 'border-primary text-primary')}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              {[
                filters.priorities.length,
                filters.statuses.length,
                filters.category_ids.length,
                filters.show_overdue ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </Button>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { field: 'position', label: 'Manual order' },
              { field: 'due_date', label: 'Due date' },
              { field: 'priority', label: 'Priority' },
              { field: 'title', label: 'Title' },
              { field: 'created_at', label: 'Date created' },
            ].map(({ field, label }) => (
              <DropdownMenuItem
                key={field}
                onClick={() =>
                  setSort(
                    field as any,
                    sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
                  )
                }
                className={cn(sortField === field && 'text-primary')}
              >
                {label}
                {sortField === field && (
                  <span className="ml-auto text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={openNewTask} className="h-8 gap-1.5 ml-auto">
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/50"
          >
            <div className="px-6 py-3 flex flex-wrap gap-4">
              {/* Priority */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Priority:</span>
                {(Object.entries(PRIORITY_CONFIG) as [Priority, any][]).map(([p, cfg]) => (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border transition-colors',
                      filters.priorities.includes(p)
                        ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Status:</span>
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border transition-colors capitalize',
                      filters.statuses.includes(s)
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">Category:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1',
                        filters.category_ids.includes(cat.id)
                          ? 'border-[var(--cat-color)] text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                      )}
                      style={{ '--cat-color': cat.color } as React.CSSProperties}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Overdue toggle */}
              <button
                onClick={() => setFilters({ show_overdue: !filters.show_overdue })}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1',
                  filters.show_overdue
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                Overdue only
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
              <ListFilter className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {hasActiveFilters
                ? 'Try adjusting or clearing your filters'
                : 'Click "Add Task" to create your first task'}
            </p>
            {!hasActiveFilters && (
              <Button size="sm" className="mt-4" onClick={openNewTask}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Task
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTask && <TaskCardDragOverlay task={activeTask} />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}

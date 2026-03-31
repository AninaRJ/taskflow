'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'motion/react'
import {
  GripVertical, CheckCircle2, Circle, Clock, Flag,
  Pencil, Trash2, AlertCircle, Tag,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, PRIORITY_CONFIG, getDueDateStatus } from '@/lib/utils'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useStore } from '@/store'
import { useTasks } from '@/hooks/useTasks'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { setTaskDialogOpen, setEditingTaskId } = useStore()
  const { update, remove } = useTasks()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const dueDateStatus = getDueDateStatus(task.due_date)
  const isDone = task.status === 'done'

  const handleToggleDone = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await update({
      id: task.id,
      status: isDone ? 'todo' : 'done',
    })
  }

  const handleEdit = () => {
    setEditingTaskId(task.id)
    setTaskDialogOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await remove(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isSortableDragging && 'opacity-40'
      )}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        onClick={handleEdit}
        className={cn(
          'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
          'bg-card hover:bg-card/80',
          isDone
            ? 'border-border/40 opacity-60'
            : dueDateStatus.isOverdue
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-border hover:border-border/80',
          'hover:shadow-lg hover:shadow-black/20',
          isDragging && 'shadow-2xl border-primary/40 scale-105 rotate-1'
        )}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Checkbox */}
        <button
          onClick={handleToggleDone}
          className="mt-0.5 shrink-0 transition-colors"
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className={cn(
              'h-5 w-5',
              dueDateStatus.isOverdue ? 'text-red-400/70' : 'text-muted-foreground/40 hover:text-muted-foreground'
            )} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              'text-sm font-medium leading-snug',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {/* Priority dot */}
            <div className={cn(
              'shrink-0 mt-0.5 w-2 h-2 rounded-full',
            )} style={{ backgroundColor: getPriorityColor(task.priority) }} />
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Priority badge */}
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border',
              priorityCfg.bgColor,
              priorityCfg.color,
              priorityCfg.borderColor,
            )}>
              <Flag className="h-2.5 w-2.5" />
              {priorityCfg.label}
            </span>

            {/* Due date */}
            {task.due_date && (
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-medium',
                dueDateStatus.color
              )}>
                {dueDateStatus.isOverdue ? (
                  <AlertCircle className="h-2.5 w-2.5" />
                ) : (
                  <Clock className="h-2.5 w-2.5" />
                )}
                {dueDateStatus.label}
              </span>
            )}

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                {task.category.name}
              </span>
            )}

            {/* Status badge (only for in_progress) */}
            {task.status === 'in_progress' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
                In Progress
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (shown on hover) */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit() }}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Task?"
        description={`Delete "${task.title}"? This action cannot be undone.`}
        destructiveText="Delete Task"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  }
  return colors[priority] ?? '#6366f1'
}

// Overlay version shown while dragging
export function TaskCardDragOverlay({ task }: { task: Task }) {
  return <TaskCard task={task} isDragging />
}

'use client'

import React, { useState, useEffect } from 'react'
import { Tag, Flag, AlignLeft, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn, PRIORITY_CONFIG, COLOR_PALETTE } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/forms'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/menus'
import { DateTimePicker } from '@/components/ui/date-picker'
import { useStore } from '@/store'
import { useTasks } from '@/hooks/useTasks'
import { useCategories } from '@/hooks/useCategories'
import type { Priority, TaskStatus } from '@/types'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function TaskFormDialog() {
  const { taskDialogOpen, setTaskDialogOpen, editingTaskId, setEditingTaskId, tasks } = useStore()
  const { create, update } = useTasks()
  const { categories, create: createCategory } = useCategories()

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null

  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Priority,
    status: 'todo' as TaskStatus,
    category_id: '',
  })

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description ?? '',
        due_date: editingTask.due_date
          ? format(new Date(editingTask.due_date), "yyyy-MM-dd'T'HH:mm")
          : '',
        priority: editingTask.priority,
        status: editingTask.status,
        category_id: editingTask.category_id ?? '',
      })
    } else {
      setForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        category_id: '',
      })
    }
  }, [editingTask, taskDialogOpen])

  const handleClose = () => {
    setTaskDialogOpen(false)
    setEditingTaskId(null)
    setShowCategoryForm(false)
    setNewCategoryName('')
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || undefined,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
        priority: form.priority,
        status: form.status,
        category_id: form.category_id || undefined,
      }

      if (editingTask) {
        await update({ id: editingTask.id, ...payload })
      } else {
        await create(payload)
      }
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const cat = await createCategory({ name: newCategoryName.trim(), color: newCategoryColor })
    if (cat) {
      setForm((f) => ({ ...f, category_id: cat.id }))
    }
    setNewCategoryName('')
    setShowCategoryForm(false)
  }

  return (
    <Dialog open={taskDialogOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            {editingTask ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5" /> Description
            </Label>
            <Textarea
              placeholder="Add more details…"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Row: Due date + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <DateTimePicker
                value={form.due_date}
                onChange={(value) => setForm((f) => ({ ...f, due_date: value }))}
                placeholder="Pick a date"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" /> Priority
              </Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(
                    ([value, cfg]) => (
                      <SelectItem key={value} value={value}>
                        <span className={cn('font-medium', cfg.color)}>{cfg.label}</span>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row: Status + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => {
                  if (v === '__new__') { setShowCategoryForm(true); return }
                  if (v === '__none__') { setForm((f) => ({ ...f, category_id: '' })); return }
                  setForm((f) => ({ ...f, category_id: v }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">
                    <span className="text-primary">+ New category</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inline new category form */}
          {showCategoryForm && (
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">New Category</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-transform',
                      newCategoryColor === color ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                  Create
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCategoryForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button className="flex-1" onClick={handleSubmit} disabled={!form.title.trim() || saving}>
              {saving ? 'Saving…' : editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState } from 'react'
import { Tag, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { cn, COLOR_PALETTE } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/forms'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'

export function CategoryManager({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { categories, create, update, remove } = useCategories()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0])
  const [showForm, setShowForm] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const resetForm = () => {
    setName('')
    setColor(COLOR_PALETTE[0])
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editingId) {
      await update(editingId, { name: name.trim(), color })
    } else {
      await create({ name: name.trim(), color })
    }
    resetForm()
  }

  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteCategoryId) return
    setIsDeleting(true)
    try {
      await remove(deleteCategoryId)
    } finally {
      setIsDeleting(false)
      setDeleteCategoryId(null)
    }
  }

  const deletingCategory = categories.find(c => c.id === deleteCategoryId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Manage Categories
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Existing categories */}
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No categories yet. Create one below.
            </p>
          ) : (
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/50"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm flex-1">{cat.name}</span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit form */}
          {showForm ? (
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                {editingId ? 'Edit Category' : 'New Category'}
              </p>
              <Input
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <div>
                <Label className="text-xs mb-1.5 block">Color</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-transform',
                        color === c ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="h-3 w-3 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
                  {editingId ? 'Save' : 'Create'}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          )}
        </div>
      </DialogContent>

      <DeleteConfirmationDialog
        open={!!deleteCategoryId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteCategoryId(null)
        }}
        title="Delete Category?"
        description={`Delete "${deletingCategory?.name}"? Tasks using it will be uncategorized.`}
        destructiveText="Delete Category"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Dialog>
  )
}

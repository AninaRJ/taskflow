'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutList, Plus, Settings, ChevronLeft, ChevronRight,
  Trash2, Edit2, CheckSquare, Code, BookOpen, Home,
  ShoppingCart, Heart, Star, Zap, Globe, Music, Camera,
  Coffee, Rocket, Target, Briefcase, Bell, BellOff,
} from 'lucide-react'
import { cn, COLOR_PALETTE, LIST_ICONS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/forms'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useLists } from '@/hooks/useLists'
import { useNotifications } from '@/hooks/useNotifications'
import { useStore } from '@/store'
import type { TaskList } from '@/types'
// Re-export for use inside Sidebar
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/menus'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  LayoutList, CheckSquare, Code, BookOpen, Home, ShoppingCart,
  Heart, Star, Zap, Globe, Music, Camera, Coffee, Rocket, Target, Briefcase,
}

function ListIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name] ?? LayoutList
  return <Icon className={className} style={style as any} />
}

interface ListFormData {
  name: string
  description: string
  color: string
  icon: string
}

const defaultForm: ListFormData = {
  name: '',
  description: '',
  color: '#6366f1',
  icon: 'LayoutList',
}

export function Sidebar() {
  const { lists, activeListId, setActiveListId, create, update, remove } = useLists()
  const { sidebarOpen, setSidebarOpen } = useStore()
  const { enableNotifications, permissionStatus, notificationPrefs, setNotificationPrefs } =
    useNotifications()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<TaskList | null>(null)
  const [form, setForm] = useState<ListFormData>(defaultForm)
  const [notifDialogOpen, setNotifDialogOpen] = useState(false)
  const [deleteListId, setDeleteListId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreate = () => {
    setEditingList(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (list: TaskList, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingList(list)
    setForm({ name: list.name, description: list.description ?? '', color: list.color, icon: list.icon })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    if (editingList) {
      await update(editingList.id, form)
    } else {
      await create(form)
    }
    setDialogOpen(false)
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteListId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteListId) return
    setIsDeleting(true)
    try {
      await remove(deleteListId)
    } finally {
      setIsDeleting(false)
      setDeleteListId(null)
    }
  }

  const deletingList = lists.find(l => l.id === deleteListId)

  const totalTasks = lists.reduce((acc, l) => acc + (l.task_count ?? 0), 0)

  return (
    <>
      {/* Toggle button when collapsed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-card border border-border rounded-r-lg p-2 hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-border overflow-hidden shrink-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <span className="font-display font-semibold text-sm tracking-wide">TaskFlow</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  My Lists
                </span>
                <button
                  onClick={openCreate}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => setActiveListId(list.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group relative',
                      activeListId === list.id
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {/* Active indicator */}
                    {activeListId === list.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                    )}

                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: list.color + '20' }}
                    >
                      <ListIcon
                        name={list.icon}
                        className="h-3.5 w-3.5"
                        style={{ color: list.color } as React.CSSProperties}
                      />
                    </div>

                    <span className="text-sm flex-1 truncate font-medium">{list.name}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(list, e)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(list.id, e)}
                        className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {lists.length === 0 && (
                <div className="px-2 py-8 text-center">
                  <p className="text-xs text-muted-foreground mb-3">No lists yet</p>
                  <Button size="sm" onClick={openCreate} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Create your first list
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 space-y-1">
              <button
                onClick={() => setNotifDialogOpen(true)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  notificationPrefs.enabled
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {notificationPrefs.enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                <span>Notifications</span>
                {notificationPrefs.enabled && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* List Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingList ? 'Edit List' : 'New Task List'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Work Projects, Personal, Shopping…"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input
                placeholder="What's this list for?"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-all',
                      form.color === color ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((f) => ({ ...f, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {LIST_ICONS.map((icon) => {
                  const Icon = ICON_MAP[icon] ?? LayoutList
                  return (
                    <button
                      key={icon}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        form.icon === icon
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>
                {editingList ? 'Save Changes' : 'Create List'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {permissionStatus === 'granted'
                    ? 'Permission granted'
                    : permissionStatus === 'denied'
                    ? 'Permission denied — check browser settings'
                    : 'Click to enable'}
                </p>
              </div>
              <Button
                size="sm"
                variant={notificationPrefs.enabled ? 'default' : 'outline'}
                onClick={async () => {
                  if (notificationPrefs.enabled) {
                    setNotificationPrefs({ enabled: false })
                  } else {
                    await enableNotifications()
                  }
                }}
              >
                {notificationPrefs.enabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>

            {notificationPrefs.enabled && (
              <>
                <div className="space-y-1.5">
                  <Label>Remind me before due (minutes)</Label>
                  <Select
                    value={String(notificationPrefs.remind_before_minutes)}
                    onValueChange={(v) =>
                      setNotificationPrefs({ remind_before_minutes: Number(v) })
                    }
                  >
                    <SelectTrigger />
                    <SelectContent>
                      {[15, 30, 60, 120, 1440].map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m < 60 ? `${m} minutes` : m === 1440 ? '1 day' : `${m / 60} hours`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Notify for overdue tasks</Label>
                  <button
                    onClick={() =>
                      setNotificationPrefs({
                        notify_on_overdue: !notificationPrefs.notify_on_overdue,
                      })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative',
                      notificationPrefs.notify_on_overdue ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        notificationPrefs.notify_on_overdue ? 'translate-x-4' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete list confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteListId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteListId(null)
        }}
        title="Delete Task List?"
        description={`Delete "${deletingList?.name}"? All tasks in this list will be permanently deleted. This action cannot be undone.`}
        destructiveText="Delete List"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}



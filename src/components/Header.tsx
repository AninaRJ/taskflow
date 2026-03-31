'use client'

import React, { useState } from 'react'
import { LayoutList, Calendar, Tag, MoreHorizontal, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CategoryManager } from '@/components/tasks/CategoryManager'
import { useStore } from '@/store'
import { useLists } from '@/hooks/useLists'
import { useTheme } from '@/providers/ThemeProvider'

export function Header() {
  const { view, setView } = useStore()
  const { lists, activeListId } = useLists()
  const { theme, toggleTheme } = useTheme()
  const activeList = lists.find((l) => l.id === activeListId)
  const [catManagerOpen, setCatManagerOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-background/80 backdrop-blur-sm">
        {/* Active list info */}
        <div className="flex items-center gap-3">
          {activeList && (
            <>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: activeList.color + '20' }}
              >
                <div style={{ color: activeList.color }} className="text-sm">
                  {/* Icon rendered inline since we can't import dynamically easily */}
                  <span className="font-bold text-xs">#</span>
                </div>
              </div>
              <div>
                <h1 className="font-display font-semibold text-base leading-tight">
                  {activeList.name}
                </h1>
                {activeList.description && (
                  <p className="text-xs text-muted-foreground">{activeList.description}</p>
                )}
              </div>
            </>
          )}
          {!activeList && (
            <h1 className="font-display font-semibold text-base text-muted-foreground">
              Select a list
            </h1>
          )}
        </div>

        {/* View switcher + actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Categories */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCatManagerOpen(true)}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="text-xs">Categories</span>
          </Button>

          {/* View toggle */}
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'calendar'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>
        </div>
      </header>

      <CategoryManager open={catManagerOpen} onOpenChange={setCatManagerOpen} />
    </>
  )
}

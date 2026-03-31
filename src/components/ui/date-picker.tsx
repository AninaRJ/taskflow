'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Clock, ChevronDown } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Input } from './forms'
import { getTodayUTC } from '@/lib/utils'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder = 'Pick a date' }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState('12:00')

  const selectedDate = value ? new Date(value) : undefined

  React.useEffect(() => {
    if (value) {
      setTime(format(new Date(value), 'HH:mm'))
    } else {
      setTime('12:00')
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange('')
      setOpen(false)
      return
    }

    const [hours, minutes] = time.split(':')
    const newDate = new Date(date)
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    onChange(newDate.toISOString())
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      onChange(newDate.toISOString())
    }
  }

  // Get today's date in user's timezone for disabling past dates
  const todayUTC = getTodayUTC()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : placeholder}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-4 p-4">
          {/* Calendar */}
          <div className="rdp-container">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable dates before today (in user's timezone)
                const dateAtMidnight = new Date(date)
                dateAtMidnight.setHours(0, 0, 0, 0)
                return dateAtMidnight < todayUTC
              }}
              classNames={{
                day_disabled: 'disabled-date',
              }}
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-2 border-t pt-4">
            <label className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" />
              Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="text-sm"
            />
          </div>

          {/* Clear button */}
          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear date
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface TimezoneContextType {
  timezone: string
  offset: number
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState('UTC')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    // Get user's timezone from system
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(userTimezone)

    // Calculate UTC offset in minutes
    const now = new Date()
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000
    setOffset(offsetMinutes)

    // Store in localStorage for persistence
    localStorage.setItem('user-timezone', userTimezone)
  }, [])

  return (
    <TimezoneContext.Provider value={{ timezone, offset }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (!context) {
    return { timezone: 'UTC', offset: 0 }
  }
  return context
}

/**
 * Get current date at midnight in user's timezone as UTC ISO string
 * This ensures "today" is consistent with user's local date
 */
export function getTodayInUserTimezone(): Date {
  const now = new Date()
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Get midnight in user's timezone
  const dateString = now.toLocaleString('en-US', {
    timeZone: userTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const [month, day, year] = dateString.split('/')
  const todayUTC = new Date(`${year}-${month}-${day}T00:00:00Z`)
  return todayUTC
}

/**
 * Get start of day (midnight) for any date in user's timezone as UTC
 */
export function getStartOfDayInUserTimezone(date: Date): Date {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const dateString = date.toLocaleString('en-US', {
    timeZone: userTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const [month, day, year] = dateString.split('/')
  return new Date(`${year}-${month}-${day}T00:00:00Z`)
}

/**
 * Convert ISO string to user's local Date object for display
 */
export function convertUTCToUserTimezone(isoString: string): Date {
  return new Date(isoString)
}

/**
 * Convert user's local datetime to ISO string for storage
 */
export function convertUserTimezoneToUTC(date: Date): string {
  return date.toISOString()
}

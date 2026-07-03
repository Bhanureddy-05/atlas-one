import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy') {
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatToday(fmt = 'EEEE, MMMM d') {
  return format(new Date(), fmt)
}

export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getProgressColor(percent: number): string {
  if (percent >= 80) return '#10b981'
  if (percent >= 50) return '#f59e0b'
  return '#ef4444'
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'easy': return '#10b981'
    case 'medium': return '#f59e0b'
    case 'hard': return '#ef4444'
    default: return '#6366f1'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return '#10b981'
    case 'in_progress': return '#6366f1'
    case 'planning': return '#f59e0b'
    case 'on_hold': return '#64748b'
    default: return '#6366f1'
  }
}

export function truncate(str: string, n = 50) {
  return str.length > n ? str.substring(0, n) + '...' : str
}

export function toHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

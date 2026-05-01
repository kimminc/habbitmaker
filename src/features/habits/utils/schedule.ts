// Design Ref: §9.1 Domain layer — 순수 로직, 외부 의존 없음 (date-fns만 사용)
import { format, getDay } from 'date-fns'
import type { Habit } from '@/types/database'

// Plan SC: 모든 날짜 처리는 date-fns 통일 (new Date() 직접 비교 금지)
export function getLocalDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function shouldShowToday(habit: Habit): boolean {
  if (habit.frequency === 'daily') return true
  const todayDayOfWeek = getDay(new Date()) // 0=일, 1=월, ..., 6=토
  return habit.frequency_days.includes(todayDayOfWeek)
}

export function formatFrequencyLabel(habit: Habit): string {
  if (habit.frequency === 'daily') return '매일'
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  return habit.frequency_days
    .slice()
    .sort((a, b) => a - b)
    .map(d => dayNames[d])
    .join('·')
}

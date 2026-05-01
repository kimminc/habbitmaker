'use client'

import { useTransition } from 'react'
import { deleteHabit } from '../actions'
import { formatFrequencyLabel } from '../utils/schedule'
import type { Habit } from '@/types/database'

interface HabitItemProps {
  habit: Habit
}

export function HabitItem({ habit }: HabitItemProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{habit.title}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {formatFrequencyLabel(habit)}
        </span>
      </div>
      <button
        onClick={() => startTransition(async () => { await deleteHabit(habit.id) })}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 dark:text-red-500 dark:hover:text-red-400"
      >
        {isPending ? '삭제 중...' : '삭제'}
      </button>
    </div>
  )
}

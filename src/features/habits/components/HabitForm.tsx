'use client'

import { useState, useTransition } from 'react'
import { createHabit } from '../actions'
import { FrequencyDaysPicker } from './FrequencyDaysPicker'
import type { HabitFrequency } from '@/types/database'

export function HabitForm() {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [frequencyDays, setFrequencyDays] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isValid =
    title.trim().length > 0 &&
    title.trim().length <= 100 &&
    (frequency === 'daily' || frequencyDays.length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createHabit(title, frequency, frequencyDays)
      if (result.error) {
        setError(result.error)
      } else {
        setTitle('')
        setFrequency('daily')
        setFrequencyDays([])
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">+ 새 습관 추가</h3>

      <input
        type="text"
        placeholder="습관 제목 (예: 아침 독서 30분)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-green-500"
      />

      <div className="mb-3 flex gap-2">
        {(['daily', 'weekly'] as HabitFrequency[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              frequency === f
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            {f === 'daily' ? '매일' : '주간'}
          </button>
        ))}
      </div>

      {frequency === 'weekly' && (
        <div className="mb-3">
          <FrequencyDaysPicker selectedDays={frequencyDays} onChange={setFrequencyDays} />
        </div>
      )}

      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!isValid || isPending}
        className="w-full rounded-lg bg-green-500 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
